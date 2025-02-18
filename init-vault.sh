#!/bin/bash
sleep 5  # Wait for Vault to start

# Set Vault address and token
export VAULT_ADDR=http://vault:8200
export VAULT_TOKEN=${VAULT_TOKEN}

# Create the secret
vault kv put secret/database \
    pg_user="${PG_USER}" \
    pg_password="${PG_PASSWORD}" \
    pg_database="${PG_DATABASE}" \
    mongo_uri="${MONGO_URI}"