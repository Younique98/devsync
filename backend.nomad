variable "pg_user" {
  type = string
}

variable "pg_password" {
  type = string
}

variable "mongo_uri" {
  type = string
}

job "devsync-backend" {
  datacenters = ["dc1"]
  type        = "service"

  group "backend" {
    count = 1

    network {
      port "http" {
        static = 5001
      }
    }

    service {
      name = "devsync-backend"
      port = "http"

      check {
        type     = "http"
        path     = "/health"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "backend" {
      driver = "docker"

      config {
        image = "devsync-backend:latest"
        ports = ["http"]
      }

      env {
        PG_USER     = var.pg_user
        PG_PASSWORD = var.pg_password
        MONGO_URI   = var.mongo_uri
        PORT        = "5001"
      }

      resources {
        cpu    = 200
        memory = 256
      }
    }
  }
}
