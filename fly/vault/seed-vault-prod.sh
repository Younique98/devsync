#!/bin/sh
# One-time production seeding for the Fly-hosted Vault, run manually by
# Erica after `vault operator init` (see DEPLOYMENT.md "Bootstrap Vault
# (one-time)") - NOT run automatically on every start the way
# init-vault.sh is for local docker-compose dev. A real, KMS-auto-unsealed
# Vault keeps its data across restarts; re-running this on every cold
# start would stomp real values with whatever's in the shell environment
# at that moment, which is correct for ephemeral local dev but wrong here.
#
# Usage: run this against the Vault app with `fly proxy 8200 -a devsync-vault`
# active in another terminal (so VAULT_ADDR=http://localhost:8200 reaches
# it), authenticated as the initial root token from `vault operator init`.
# See DEPLOYMENT.md for the full sequence this fits into.
#
# Same key shape as init-vault.sh (PG_USER/PG_PASSWORD/PG_DATABASE/PG_HOST/
# MONGO_URI under secret/database, SECRET_KEY under secret/auth) - database.ts
# and auth.ts don't care whether Vault is the local dev instance or this one.

set -eu

: "${VAULT_ADDR:?Set VAULT_ADDR (e.g. http://localhost:8200 via fly proxy)}"
: "${VAULT_TOKEN:?Set VAULT_TOKEN to the root token from vault operator init}"
: "${PG_USER:?}"
: "${PG_PASSWORD:?}"
: "${PG_DATABASE:?}"
: "${PG_HOST:?e.g. devsync-postgres-db.internal - see DEPLOYMENT.md}"
: "${MONGO_URI:?Atlas M0 connection string - see DEPLOYMENT.md}"
: "${JWT_SECRET_KEY:?}"

# KV v2 isn't enabled by default outside of `vault server -dev` - enable it
# once, idempotently.
vault secrets enable -path=secret -version=2 kv-v2 2>/dev/null || true

vault kv put secret/database \
    PG_USER="${PG_USER}" \
    PG_PASSWORD="${PG_PASSWORD}" \
    PG_DATABASE="${PG_DATABASE}" \
    PG_HOST="${PG_HOST}" \
    MONGO_URI="${MONGO_URI}"

vault kv put secret/auth \
    SECRET_KEY="${JWT_SECRET_KEY}"

# Least-privilege policy + a periodic (renewable, non-root) token for the
# app to actually run with - see devsync-app-policy.hcl.
vault policy write devsync-app "$(dirname "$0")/devsync-app-policy.hcl"

echo ""
echo "Vault seeded. Now create the app's real token and set it as a Fly secret:"
echo ""
echo "    vault token create -policy=devsync-app -period=768h -field=token"
echo ""
echo "Take that token and run, from the backend app:"
echo "    fly secrets set VAULT_TOKEN=<token> -a devsync-backend"
echo ""
echo "Put the root token (VAULT_TOKEN you used to run this script) away for"
echo "break-glass use only - it should not be what's deployed as VAULT_TOKEN."
