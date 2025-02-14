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

![System Architecture](docs/system-architecture.png)

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

### **4️⃣ Start Everything Using Docker**
To start all services together:
```sh
docker-compose up --build
```

### **5️⃣ Access Services**
| Service   | URL / Command |
|-----------|--------------|
| **Backend API** | http://localhost:5001 |
| **PostgreSQL** | `psql -h localhost -U PG_USER -d devsync` |
| **MongoDB** | `mongosh mongodb://localhost:27017/devsync` |
| **Vault** | http://localhost:8200 |
| **Consul** | http://localhost:8500 |
| **Nomad** | http://localhost:4646 |

### **6️⃣ Stopping Everything**
To stop all containers:
```sh
docker-compose down
```
To stop and **delete all containers, networks, and volumes**:
```sh
docker-compose down -v
```

---

## 🏗️ **Infrastructure Setup (Terraform + Nomad)**
To deploy infrastructure:
```sh
terraform init
terraform apply
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

## 📂 **Project Structure**
```
DevSync/
│── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config/
│   ├── server.ts
│   ├── database.ts
│   ├── package.json
│
│── frontend/
│   ├── components/
│   ├── pages/
│   ├── redux/
│   ├── styles/
│   ├── package.json
│   ├── next.config.js
│
│── infrastructure/
│   ├── terraform/
│   ├── nomad/
│
│── docs/
│   ├── system-architecture.png
│
│── .gitignore
│── README.md
```

---

## 🐳 **Docker Support**

### **Dockerfile Explanation**
- **Defines how to build the backend container**.
- Uses **Node.js 18**.
- **Copies package.json first** for caching dependencies.
- **Installs dependencies inside the container**.
- **Copies source files** into the container.
- **Runs `npm run dev` to start the backend**.

### **Docker Compose Explanation**
- **Manages multiple services together**.
- **Starts PostgreSQL, MongoDB, Vault, Consul, and Nomad**.
- **Automatically runs `npm run dev` inside the backend container**.
- **Maps environment variables from the `.env` file**.

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