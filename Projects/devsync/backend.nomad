job "backend" {
  datacenters = ["dc1"]
  type        = "service"

  group "backend-group" {
    count = 1

    network {
      mode = "bridge"
      port "http" {
        static = 3000
      }
    }

    service {
      name = "backend-service"
      provider = "consul"
      port = "http"

      check {
        type     = "http"
        path     = "/health"
        interval = "10s"
        timeout  = "2s"
      }
    }

    task "backend-task" {
      driver = "docker"

      config {
        image = "erica/devsync-backend:latest"
        ports = ["http"]
      }

      env {
        DATABASE_URL = "postgres://admin:supersecure123@localhost:5432/devsync"
      }
    }
  }
}
