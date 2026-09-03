# Fly-hosted production Vault. docker-compose.yml's local devsync-vault
# service runs the stock hashicorp/vault image directly with no Dockerfile
# of its own (dev mode, started via a `command:` override) - there's
# nothing to adapt from for a real server config, so this is new.
#
# Pinned to the 1.x line deliberately, not 2.0.x (Vault's current major as
# of mid-2026) - the awskms seal / raft-vs-file storage / kv-v2 semantics
# this config and DEPLOYMENT.md rely on are well-established for 1.x,
# and this sandbox couldn't reach developer.hashicorp.com to confirm 2.0.x
# hasn't changed any of that. Worth revisiting once you've read HashiCorp's
# own 1.x -> 2.0 upgrade notes.
FROM hashicorp/vault:1.21.9

COPY vault-config.hcl /vault/config/vault-config.hcl

EXPOSE 8200 8201

CMD ["server", "-config=/vault/config/vault-config.hcl"]
