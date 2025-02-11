# DevSync - Full-Stack DevOps Platform

## 🚀 Overview
DevSync is a **full-stack DevOps monitoring and automation platform** that leverages **HashiCorp tools** to manage infrastructure, secrets, deployments, and observability efficiently. It is designed for engineers who need a **scalable**, **secure**, and **automated** DevOps pipeline. This repository contains both the **frontend and backend** components, ensuring a seamless integration of the entire system.

---

## ✨ Features
- **Authentication & Authorization** (JWT-based, OAuth2)
- **Secrets Management** (HashiCorp Vault for secure credential storage)
- **Infrastructure as Code** (Terraform & Nomad for automated provisioning)
- **Database Support** (PostgreSQL + MongoDB integration)
- **Custom GitHub Actions** for **CI/CD automation**
- **Containerized Deployment** (Docker + Kubernetes)
- **Monitoring & Logging** (DataDog, Prometheus, Loki, Grafana)
- **Role-based Access Control (RBAC)** for user permissions
- **Health Checks & Service Discovery** (Consul + Nomad)
- **Full-Stack Monitoring Dashboard**

---

## 🛠 Tech Stack

### **Frontend:**
- React.js + Next.js (Server-Side Rendering)
- TypeScript
- TailwindCSS (for styling)
- Redux Toolkit (State Management)
- React Query (Data Fetching)
- Vercel (Deployment)

### **Backend:**
- Node.js (Express + TypeScript)
- PostgreSQL (Relational Database)
- MongoDB (NoSQL Database)
- Redis (Caching Layer)

### **Infrastructure & DevOps:**
- HashiCorp Vault (Secrets Management)
- HashiCorp Terraform (Infrastructure as Code)
- HashiCorp Nomad (Container Orchestration)
- GitHub Actions (CI/CD)
- Docker & Kubernetes (Containerization & Deployment)
- DataDog (Monitoring & Observability)

---

## 📊 **System Architecture**

Below is an **architecture diagram** showcasing how DevSync’s components interact:

```
             +---------------------------+
             |        User Request       |
             +------------+--------------+
                          |
                          v
             +---------------------------+
             |       Frontend (React)    |
             |  (Next.js + TypeScript)   |
             +------------+--------------+
                          |
                          v
             +---------------------------+
             |        Express API         |
             |  (Node.js + TypeScript)    |
             +------------+--------------+
                          |
       ---------------------------------
      |                                 |
      v                                 v
+------------+                   +------------+
|  PostgreSQL |                   |  MongoDB   |
| (Relational) |                   |  (NoSQL)  |
+------------+                   +------------+
      |                                 |
      |         +-------------------+  |
      |-------->| HashiCorp Vault   |  |
      |         +-------------------+  |
      |                                 |
      v                                 v
+-------------------+       +-------------------+
|  HashiCorp Nomad |       | HashiCorp Terraform|
+-------------------+       +-------------------+
```

---

## 🔧 **Setup & Installation**

### **1️⃣ Clone the repository**
```sh
git clone https://github.com/yourusername/devsync.git
cd devsync
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Set up environment variables**
Create a `.env` file:
```ini
VAULT_ADDR=http://127.0.0.1:8200
VAULT_TOKEN=your-root-token
PG_USER=your_postgres_user
PG_PASSWORD=your_postgres_password
PG_DATABASE=devsync
MONGO_URI=mongodb://localhost:27017/devsync
```

### **4️⃣ Start HashiCorp Vault**
```sh
vault server -dev
```

### **5️⃣ Start PostgreSQL & MongoDB** (if not already running)
```sh
brew services start postgresql@14
brew services start mongodb-community
```

### **6️⃣ Run the backend**
```sh
npm run dev
```

### **7️⃣ Run the frontend**
```sh
cd frontend
npm run dev
```

---

## 🏗️ **Infrastructure Setup (Terraform + Nomad)**
To deploy infrastructure:
```sh
terraform init
tarraform apply
nomad run devsync.nomad
```

---

## ✅ **API Endpoints**
| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| `POST` | `/api/auth/login`   | User login            |
| `GET`  | `/api/users`        | Get user list         |
| `POST` | `/api/deploy`       | Trigger deployment    |

---

## 🐳 **Docker Support**
To build and run with Docker:
```sh
docker-compose up --build
```

---

## 🚀 **Deployment**
This project supports **GitHub Actions CI/CD** and **Nomad Job Scheduling**. To deploy:

```sh
nomad run devsync.nomad
```

---

## 📜 **License**
This project is licensed under the **MIT License**.

## ✨ **Contributors**
- **Erica Thompson** - [LinkedIn](https://linkedin.com/in/ericathompsonsmiles)
- Open to contributions! Feel free to fork and submit PRs.

## 📢 **Feedback & Contributions**
We welcome **issues, pull requests, and discussions**! Feel free to contribute, suggest features, or report bugs.

---

🚀 **DevSync** - The future of **automated DevOps monitoring and management!** 🎯

