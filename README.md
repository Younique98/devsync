# DevSync - Full-Stack DevOps Platform

## 🚀 Overview
DevSync is a **full-stack DevOps monitoring and automation platform** that leverages **HashiCorp tools** to manage infrastructure, secrets, deployments, and observability. It is designed for engineers who need a **scalable**, **secure**, and **automated** DevOps pipeline. This repository contains both the **frontend and backend** components, integrated with real, working infrastructure config rather than just placeholder docs.

---

## ✨ Features
- **Authentication & Authorization** - JWT-based (`auth.ts`), plus GitHub OAuth2 (`oauth.ts`, `/auth/github`)
- **Secrets Management** - HashiCorp Vault for secure credential storage (`auth.ts`, `database.ts`)
- **Infrastructure as Code** - Terraform (`main.tf`) provisions Vault secrets and a Nomad job (`backend.nomad`)
- **Database Support** - PostgreSQL + MongoDB, connected via credentials pulled from Vault
- **CI/CD** - GitHub Actions workflow (`.github/workflows/ci.yml`): lint, typecheck, unit tests, a real migration run against a Postgres service container, and a production build, on every push/PR
- **Containerized Deployment** - Docker Compose for local dev, plus Kubernetes manifests (`k8s/`) for cluster deployment
- **Monitoring & Logging** - Prometheus scrapes a real `/metrics` endpoint (`server.ts`), Grafana is pre-provisioned with Prometheus + Loki datasources, Promtail ships container logs to Loki
- **Role-based Access Control (RBAC)** - `requireRole()` in `auth.ts`, enforced on `/admin/status` and `/api/vault`
- **Health Checks & Service Discovery** - the backend self-registers with Consul on startup with an HTTP health check, and deregisters on shutdown (`serviceDiscovery.ts`)
- **Monitoring Dashboard** - `/dashboard` shows live backend health and links to Grafana/Prometheus/Consul/Nomad/Vault

See [Areas for Improvement](#-areas-for-improvement) below for the couple of things that need real infrastructure credentials I don't have to fully wire up, or a larger fix than fits this pass.

---

## 🛠 Tech Stack

### **Frontend:**
- React + Next.js (Pages Router)
- TypeScript
- TailwindCSS

### **Backend:**
- Node.js (Express + TypeScript)
- PostgreSQL (`pg`) + MongoDB (`mongoose`)
- JWT (`jsonwebtoken`) + `bcryptjs` for password hashing
- `prom-client` for Prometheus metrics

### **Infrastructure & DevOps:**
- HashiCorp Vault (Secrets Management)
- HashiCorp Terraform (Infrastructure as Code)
- HashiCorp Nomad + Consul (Container Orchestration, Service Discovery)
- GitHub Actions (CI/CD)
- Docker Compose (local dev) & Kubernetes manifests (`k8s/`)
- Prometheus, Grafana, Loki + Promtail (Monitoring & Logging)

---

## 📊 **System Architecture**

![System Architecture](docs/devsync-architecture.svg)

---

## 🔧 **Setup & Installation**

### **1️⃣ Clone the repository**
```sh
git clone git@github.com:Younique98/devsync.git
cd devsync
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Set up environment variables**
Create a `.env` file:
```ini
# Vault
VAULT_ADDR=http://devsync-vault:8200
VAULT_TOKEN=your-root-token

# Postgres / Mongo (seeded into Vault by init-vault.sh)
PG_USER=your_postgres_user
PG_PASSWORD=your_postgres_password
PG_DATABASE=devsync
MONGO_URI=mongodb://localhost:27017/devsync
MONGO_DATABASE=devsync
MONGO_USER=your_mongo_user
MONGO_PASSWORD=your_mongo_password

# Service discovery
CONSUL_ADDR=http://devsync-consul:8500

# GitHub OAuth2 (create an OAuth App at https://github.com/settings/developers)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5001/auth/github/callback

# Frontend -> backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001

# Grafana (optional, defaults to admin/admin)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
```

### **4️⃣ Start Everything Using Docker**
```sh
docker-compose up --build
```

### **5️⃣ Access Services**
| Service         | URL / Command |
|-----------------|----------------|
| **Frontend**    | http://localhost:3000 |
| **Dashboard**   | http://localhost:3000/dashboard |
| **Backend API** | http://localhost:5001 |
| **Metrics**     | http://localhost:5001/metrics |
| **PostgreSQL**  | `psql -h localhost -U PG_USER -d devsync` |
| **MongoDB**     | `mongosh mongodb://localhost:27017/devsync` |
| **Vault**       | http://localhost:8200 |
| **Consul**      | http://localhost:8500 |
| **Nomad**       | http://localhost:4646 |
| **Prometheus**  | http://localhost:9090 |
| **Grafana**     | http://localhost:3001 |
| **Loki**        | http://localhost:3100 |

### **6️⃣ Run database migrations**
```sh
npm run migrate
```
Applies each `.sql` file in `migrations/` exactly once, tracked in a `schema_migrations` table.

### **7️⃣ Stopping Everything**
```sh
docker-compose down       # stop
docker-compose down -v    # stop + delete volumes
```

---

## 🏗️ **Infrastructure Setup (Terraform + Nomad)**
```sh
terraform init
terraform apply
```
`terraform apply` seeds Vault with DB credentials and deploys `backend.nomad` to Nomad via the `nomad_job` resource in `main.tf`.

---

## ✅ **API Endpoints**
| Method | Endpoint                | Description                                              |
|--------|--------------------------|-----------------------------------------------------------|
| `GET`  | `/health`                | Health check (also the Consul + Kubernetes probe target) |
| `GET`  | `/metrics`                | Prometheus-formatted metrics                              |
| `POST` | `/login`                  | Username/password login against the demo user store, returns a JWT |
| `GET`  | `/auth/github`             | Redirects to GitHub's OAuth2 authorize page                |
| `GET`  | `/auth/github/callback`    | Exchanges the OAuth code, returns a JWT                    |
| `GET`  | `/admin/status`            | RBAC-protected (`admin` role) - Postgres/Mongo connection status |
| `GET`  | `/api/vault`               | Next.js API route proxying secrets from Vault, RBAC-protected (`admin` role) |

**Demo login credentials** (see `users.ts`): `admin` / `admin123` (role: `admin`), `demo` / `demo123` (role: `user`).

---

## 📂 **Project Structure**
```
devsync/
│── auth.ts                 # JWT generation/verification + requireRole() RBAC guard
│── users.ts                 # In-memory demo user store (bcrypt-hashed)
│── oauth.ts                  # GitHub OAuth2 authorize URL + code exchange
│── serviceDiscovery.ts        # Consul service registration/deregistration
│── database.ts                 # PostgreSQL + MongoDB connections via Vault secrets
│── server.ts                    # Express backend: health, metrics, login, OAuth, RBAC routes
│── migrations/
│   ├── migrate.js                # Migration runner (tracks applied migrations)
│   └── 001_create_users_table.sql
│── pages/
│   ├── _app.tsx
│   ├── index.tsx
│   ├── dashboard.tsx              # Live backend health + links to monitoring tools
│   └── api/vault.ts                # RBAC-protected Vault secrets proxy
│── __tests__/                       # Jest unit + supertest integration tests
│── k8s/                               # Kubernetes manifests (namespace, Deployment, Service, Secret template)
│── monitoring/
│   ├── prometheus.yml
│   ├── loki-config.yml
│   ├── promtail-config.yml
│   └── grafana-datasources.yml
│── docs/
│   └── devsync-architecture.svg
│── nomad-config/
│   └── nomad.hcl                     # Nomad agent config
│── main.tf                            # Terraform: Vault secrets + Nomad job deployment
│── backend.nomad                       # Nomad job spec for the backend
│── init-vault.sh                        # Seeds Vault with DB credentials on startup
│── Dockerfile
│── docker-compose.yml                    # Postgres, MongoDB, Vault, Consul, Nomad, Prometheus, Loki, Promtail, Grafana, backend
│── tsconfig.json                          # Frontend + tests (noEmit - Next.js handles its own bundling)
│── tsconfig.server.json                    # Backend build config (emits to build/, used by `npm start`)
│── .github/workflows/ci.yml
│── .gitignore
│── README.md
```

---

## 🐳 **Docker Support**

### **Dockerfile**
Node.js 18 base image, installs dependencies, copies source, runs `npm run dev` on port 5001.

### **Docker Compose**
Brings up the full stack together: Postgres, MongoDB, Vault (+ setup job that seeds it), Consul, Nomad, the backend, and the monitoring stack (Prometheus, Loki, Promtail, Grafana).

---

## 🧪 **Testing**
```sh
npm run lint                                # eslint
npx tsc --noEmit                            # typecheck: frontend + tests
npx tsc -p tsconfig.server.json --noEmit    # typecheck: backend (server.ts et al.)
npm test                                    # jest + supertest - RBAC, JWT, OAuth2 exchange, Consul registration, and live HTTP routes
```
All of the above run in CI on every push/PR, along with a real migration run against a Postgres service container and `npm run build` (which builds both the Next.js frontend and compiles the Express backend into `build/`, matching what `npm start` actually runs).

---

## 🚀 **Deployment**
Deploy the Nomad job directly:
```sh
nomad run backend.nomad
```
or via Terraform (`terraform apply`, see above). For Kubernetes, apply the manifests in `k8s/` after filling in `k8s/secrets.yaml` from the `k8s/secrets.example.yaml` template.

---

## 🔭 **Areas for Improvement**

A few things that are genuinely out of reach without infrastructure I don't have access to in this environment, or that need a larger follow-up than fits here:

- **DataDog** - needs a real DataDog account and API key I don't have. The Prometheus/Grafana/Loki stack covers the same "Monitoring & Logging" ground and is fully self-hosted; a DataDog agent could be added to `docker-compose.yml` the same way once there's a key to configure it with.
- **GitHub OAuth2 end-to-end** - the authorize-URL and code-exchange logic (`oauth.ts`) is real and unit-tested against a mocked GitHub API, and the `/auth/github` + `/auth/github/callback` routes are integration-tested. What's *not* tested is a live round trip against the real GitHub OAuth service, since that needs a real registered OAuth App's client ID/secret.
- **Demo user store -> real Postgres table** - `users.ts` is an in-memory demo store (clearly marked as such) so the login flow can be exercised end-to-end without a full user-management feature. `migrations/001_create_users_table.sql` already creates the real `users` table this should read from instead - swapping `users.ts` to query it is the next step.
- **MongoDB, and the containers themselves** - I don't have a way to run MongoDB or pull Docker images in this environment, so those two specific pieces haven't been exercised live. Everything else that touches the Vault/Postgres/Consul chain *has* been - see below.

### What "verified" actually means here

Earlier passes on this repo said the full stack "hadn't been booted together" without much detail. Concretely, this time I downloaded real Vault and Consul binaries (both reachable, unlike Docker Hub or MongoDB's CDN in this sandbox) and a real local Postgres, and ran the actual application code against them - not mocks. That surfaced and fixed real bugs mocked unit tests couldn't have caught, because the mocks had been shaped to match what the code already expected rather than what a real Vault server returns:

- `database.ts` was reading Vault's KV v1 API shape (`secret/database`, one level of unwrapping) against a mount that defaults to KV v2 - every credential fetch would have come back empty against any standard Vault, including the one in `docker-compose.yml`.
- `init-vault.sh` pointed at a Vault hostname (`vault`) that doesn't exist on the compose network (the service is `devsync-vault`), wrote lowercase keys (`pg_user`) while `database.ts` reads uppercase (`PG_USER`), never seeded `PG_HOST` at all, and never seeded the JWT signing secret (`secret/auth`) that `auth.ts` needs.
- The `devsync-vault-setup` container that runs `init-vault.sh` never had `PG_USER`/`PG_PASSWORD`/`PG_DATABASE`/`MONGO_URI` in its own environment block in `docker-compose.yml`, so even a fixed script would have seeded blank credentials.

All of that is fixed now, and re-verified against real (not mocked) running Vault + Consul + Postgres: a real JWT is generated and verified using a real Vault-stored signing key, RBAC correctly accepts/rejects based on it, the backend genuinely registers itself in Consul's live service catalog, and Postgres connects successfully using credentials fetched live from Vault through the app's actual code path. Two things are still unverified because MongoDB and Docker image pulls are both unreachable in this sandbox: whether `mongoose.connect()` succeeds against the real `devsync-mongodb` service, and whether the containers actually build and boot together via `docker-compose up --build`. Run that once, locally, and watch the logs before treating this as demo-ready - if it doesn't come up clean, the Vault/Consul/Postgres wiring bugs above are exactly the shape of thing to check first.

- **Kubernetes manifests** - written to standard patterns and YAML-validated, but not applied against a real cluster.

---

## 📜 **License**
This project is licensed under the **MIT License**.

## ✨ **Contributors**
- **Erica Thompson** - [LinkedIn](https://linkedin.com/in/ericathompsonsmiles)
- Open to contributions! Feel free to fork and submit PRs.

---

🚀 **DevSync** - The future of **automated DevOps monitoring and management!** 🎯
