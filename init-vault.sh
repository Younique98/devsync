#!/bin/bash
sleep 5  # Wait for Vault to start

# Set Vault address and token - must match the Vault service's name on the
# docker-compose network (devsync-vault), not a bare "vault" hostname.
export VAULT_ADDR=http://devsync-vault:8200
export VAULT_TOKEN=${VAULT_TOKEN}

# Create the secret. Keys are uppercase to match how database.ts destructures
# them (PG_USER, PG_PASSWORD, PG_DATABASE, PG_HOST, MONGO_URI) - a mismatch
# here means connectDatabases() throws "Missing PostgreSQL credentials" even
# with Vault reachable and seeded. PG_HOST is the Postgres service's name on
# the docker-compose network.
vault kv put secret/database \
    PG_USER="${PG_USER}" \
    PG_PASSWORD="${PG_PASSWORD}" \
    PG_DATABASE="${PG_DATABASE}" \
    PG_HOST="devsync-postgres" \
    MONGO_URI="${MONGO_URI}"

# Auth signing secret - auth.ts reads this from secret/data/auth (SECRET_KEY).
# This was never seeded at all before, so token generation/verification would
# fail with "Vault configuration missing" even once the database secret was
# fixed. Set JWT_SECRET_KEY in .env for anything beyond local dev; this
# fallback is fine for a single-instance demo but is not a secret.
vault kv put secret/auth \
    SECRET_KEY="${JWT_SECRET_KEY:-local-dev-only-jwt-signing-secret-change-me}"