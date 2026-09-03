# Least-privilege policy for the token the running backend/frontend
# actually use (VAULT_TOKEN in `fly secrets`) - read-only access to the two
# paths database.ts / auth.ts / pages/api/vault.ts read
# (secret/data/database, secret/data/auth). Nothing else.
#
# This replaces using the initial root token as VAULT_TOKEN long-term -
# see "Bootstrap Vault (one-time)" in DEPLOYMENT.md for how this gets
# applied and how the actual app token gets created from it. The root
# token created by `vault operator init` should be put away after that
# bootstrap (e.g. in a password manager) for break-glass use only, not left
# sitting in a Fly secret that every deploy/build log or `fly ssh console`
# session could see.

path "secret/data/database" {
  capabilities = ["read"]
}

path "secret/data/auth" {
  capabilities = ["read"]
}
