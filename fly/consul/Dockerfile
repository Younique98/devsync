# Fly-hosted Consul for service discovery (serviceDiscovery.ts registers/
# deregisters devsync-backend against this on startup/shutdown). Local
# docker-compose runs the stock hashicorp/consul image directly
# (`command: ['agent', '-dev']`, no Dockerfile of its own) - adapted here
# into a Dockerfile only because Fly needs one image+command baked
# together per app, plus the -client bind flag Flycast requires (see
# fly.toml).
#
# Single-node dev-agent mode (in-memory, no persistence, no ACLs/gossip
# encryption) is a deliberate, reasonable choice for what this app
# actually asks of Consul today: the backend just self-registers a service
# + HTTP health check on startup and deregisters on shutdown (see
# serviceDiscovery.ts) - no one's storing secrets in Consul KV or running
# a real multi-node cluster. Scale-to-zero already resets this catalog on
# every cold start the same way it's reset on every `docker-compose up`
# locally today, and registerWithConsul() re-populates it as soon as the
# backend comes up. If Consul ever needs to hold anything sensitive or run
# multi-node, it needs real ACLs/TLS/gossip-encryption config - a bigger
# change than this deployment pass, not something to bolt on quietly here.
FROM hashicorp/consul:1.20

EXPOSE 8500

CMD ["agent", "-dev", "-client=0.0.0.0"]
