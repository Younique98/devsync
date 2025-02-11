provider "vault" {
   address = "http://127.0.0.1:8200"
}

provider "nomad" {
    address = "http://127.0.0.1:4646"
}

provider "consul" {
    address = "http://127.0.0.1:8500"
}

resource "vault_generic_secret" "database_secrets" {
  path = "secret/database"
  data_json = jsonencode({
    PG_USER      = "admin"
    PG_PASSWORD  = "supersecure123"
    MONGO_URI    = "mongodb://localhost:27017/devsync"
  })
}

resource "nomad_job" "backend_service" {
    jobspec = file("$path.module}/backend.nomad")
}