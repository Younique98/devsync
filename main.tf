variable "pg_user" {
  description = "PostgreSQL username"
  type        = string
  sensitive   = true
}

variable "pg_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "mongo_uri" {
  description = "MongoDB Connection URI"
  type        = string
  sensitive   = true
}

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
    PG_USER      = var.pg_user
    PG_PASSWORD  = var.pg_password
    MONGO_URI    = var.mongo_uri
  })
}

resource "nomad_job" "backend_service" {
  jobspec = file("${path.module}/backend.nomad")
}



