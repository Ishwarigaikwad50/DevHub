# DevHub — Internal Developer Service Catalog

DevHub is a full-stack internal developer platform designed to help engineering teams **discover, manage, and organize software services in one centralized system**.

It provides a structured view of services, ownership, APIs, environments, dependencies, deployments, and operational information, making it easier for developers to understand and work with an organization's software ecosystem.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* Secure user authentication
* JWT-based authentication
* Role-based access control
* Protected routes and APIs
* Different permissions for administrators and developers

### 📦 Service Catalog

* Register and manage software services
* View service information in a centralized catalog
* Service ownership and team information
* Repository and documentation links
* Technology and service metadata
* Service status tracking

### 👥 Team Management

* Create and manage engineering teams
* Assign services to teams
* Manage team ownership
* View services owned by a particular team

### 🔌 API Catalog

* Register APIs associated with services
* Store API endpoint information
* HTTP method and version tracking
* API descriptions
* View APIs from individual service pages

### 🌐 Environment Management

Manage service information across environments such as:

* Development
* Staging
* Production

Track environment-specific service information and deployment details.

### 🔗 Service Dependencies

DevHub allows developers to define relationships between services.

Example:

```text
Order Service
      │
      ├──→ Payment Service
      │
      └──→ Notification Service
```

This makes upstream and downstream service relationships easier to understand.

### 📊 Dependency Visualization

Services and their relationships can be represented visually to help developers understand how different parts of the software ecosystem interact.

### 🚀 Deployment Tracking

Track deployment information including:

* Service
* Environment
* Version
* Deployment status
* Deployment history

### ❤️ Service Health

Monitor the operational status of registered services and provide visibility into service health.

### 🔎 Search & Filtering

Search and filter services using information such as:

* Service name
* Team
* Technology
* Environment
* Status

### 📋 Audit Logs

Track important changes made within the platform.

Examples include:

```text
Service Created
Service Updated
Dependency Added
API Updated
Deployment Created
```

This provides visibility into who performed an action and when it occurred.

### 📈 Dashboard

The dashboard provides an overview of the engineering ecosystem, including:

* Total services
* Service health
* Teams
* APIs
* Deployments
* Recent activity

---

# 🏗️ System Architecture

```text
                  ┌──────────────────────┐
                  │      React Client    │
                  │                      │
                  │ Dashboard            │
                  │ Service Catalog      │
                  │ Teams                │
                  │ APIs                  │
                  │ Dependencies         │
                  └──────────┬───────────┘
                             │
                          REST API
                             │
                             ▼
                  ┌──────────────────────┐
                  │   Node.js + Express  │
                  │                      │
                  │ Authentication       │
                  │ Services             │
                  │ Teams                │
                  │ APIs                  │
                  │ Deployments          │
                  │ Dependencies         │
                  │ Audit Logs            │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │       MongoDB        │
                  │                      │
                  │ Users                │
                  │ Teams                │
                  │ Services             │
                  │ APIs                 │
                  │ Environments         │
                  │ Dependencies         │
                  │ Deployments          │
                  │ Audit Logs            │
                  └──────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* React Flow
* Lucide React

## Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcrypt
* Mongoose

## Database

* MongoDB

# 🗄️ Core Data Models

DevHub is organized around several core entities:

```text
User
Team
Service
API
Environment
Dependency
Deployment
HealthCheck
AuditLog
Notification
```

The main relationship can be represented as:

```text
Team
  │
  └── owns ──→ Service
                  │
                  ├── exposes ──→ API
                  │
                  ├── runs in ──→ Environment
                  │
                  ├── depends on ──→ Service
                  │
                  └── has ──→ Deployments
```

---

# 🔑 Authentication & Security

DevHub uses JWT-based authentication to protect application resources.

Security considerations include:

* Password hashing
* JWT authentication
* Role-based authorization
* Protected API routes
* Input validation
* Environment variables for sensitive configuration
* No credentials stored directly in source code

---

# ⚙️ Installation & Setup

## 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd DevHub
```

## 2. Install frontend dependencies

```bash
cd client
npm install
```

## 3. Install backend dependencies

Open another terminal:

```bash
cd server
npm install
```

## 4. Configure environment variables

Create a `.env` file inside the backend directory.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit the `.env` file to GitHub.

## 5. Start the backend

```bash
cd server
npm run dev
```

## 6. Start the frontend

```bash
cd client
npm run dev
```

The application will then be available through the local Vite development server.

---

# 🔄 Application Workflow

A typical DevHub workflow:

```text
User Login
    ↓
Dashboard
    ↓
Service Catalog
    ↓
Select Service
    ↓
Service Details
    ├── Overview
    ├── APIs
    ├── Environments
    ├── Dependencies
    ├── Deployments
    ├── Health
    └── Activity
```

---

# 🎯 Problem Solved

In software organizations, information about services is often distributed across repositories, documentation, spreadsheets, and communication platforms.

DevHub provides a centralized catalog where developers can quickly discover:

* What services exist
* Who owns them
* What APIs they provide
* Where they are deployed
* What services they depend on
* Their deployment history
* Their current operational status

This reduces the effort required to understand an organization's software ecosystem.

---

# 💡 Future Improvements

Potential improvements include:

* GitHub repository integration
* Automated service metadata synchronization
* GitHub Actions deployment integration
* Advanced service health monitoring
* Redis-based caching
* API usage analytics
* Service dependency impact analysis
* Email/Slack notifications
* Service documentation generation
* Advanced search
* CI/CD pipeline integration

## ⭐ Project Highlights

**DevHub demonstrates practical software engineering concepts including:**

* Full-stack MERN development
* REST API design
* Authentication & authorization
* Role-based access control
* MongoDB data modeling
* Service dependency management
* API management
* Deployment tracking
* Health monitoring
* Audit logging
* Search and filtering
* Dashboard development
* Modular backend architecture

---

## 📌 Project Category

**Full-Stack Software Development | Internal Developer Platform | MERN Stack**
