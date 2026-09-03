# Production Vault server config for the Fly-hosted devsync-vault app.
#
# This is a REAL server config (not `vault server -dev`) - Vault starts
# sealed and uninitialized the first time it ever runs against this
# storage, and stays sealed on every restart until unsealed. The
# "seal \"awskms\"" block below is what makes that unsealing automatic:
# on every cold start (including waking from Fly's scale-to-zero), Vault
# calls AWS KMS to decrypt its stored root key and unseals itself with no
# human running `vault operator unseal` and no Shamir key shares held by
# anyone. This is Vault's standard, documented production auto-unseal
# pattern (https://developer.hashicorp.com/vault/docs/configuration/seal/awskms) -
# not a shortcut. The only manual step, ever, is the one-time
# `vault operator init` right after the very first deploy - see
# DEPLOYMENT.md "Bootstrap Vault (one-time)".

listener "tcp" {
  address     = "0.0.0.0:8200"
  # Flycast (the private Fly Proxy network this app is reachable on - see
  # fly.toml) is HTTP-only end to end; Fly's edge network already runs
  # inside AWS/GCP-grade physical security and this listener isn't reachable
  # from the public internet at all (no public IP is allocated to this
  # app - see DEPLOYMENT.md). TLS is still worth adding later if Vault
  # ever needs to be reached over WireGuard from outside Fly's network.
  tls_disable = true
}

storage "file" {
  path = "/vault/data"
}

# AWS KMS auto-unseal. kms_key_id and region are deliberately NOT hardcoded
# here - the awskms seal reads them from VAULT_AWSKMS_SEAL_KEY_ID and
# AWS_REGION (both set as `fly secrets`/[env] - see fly.toml and
# DEPLOYMENT.md), plus standard AWS credential env vars
# (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY) for a narrowly-scoped IAM
# user that can only kms:Encrypt/Decrypt/DescribeKey on that one key.
seal "awskms" {}

# No IPC_LOCK-equivalent capability is granted to Fly Machines (unlike the
# `cap_add: [IPC_LOCK]` the local docker-compose Vault container gets), so
# Vault can't mlock its memory here. Vault explicitly documents disabling
# mlock as the correct fallback in containerized environments without that
# capability (rather than failing to start) - this is a normal, expected
# setting for a containerized Vault, not a security downgrade specific to
# this being a smaller deployment.
disable_mlock = true

# Flycast-private hostname (see fly.toml) - used for Vault's own
# self-referential API/cluster addresses, not for public access.
api_addr     = "http://devsync-vault.flycast:8200"
cluster_addr = "http://devsync-vault.flycast:8201"

ui = true
