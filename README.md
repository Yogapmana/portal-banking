# 🏦 Banking Portal - Customer Management System

A modern, secure web-based customer relationship management (CRM) platform designed specifically for banking sales teams to manage customer data, track sales performance, and analyze customer probability scores.

![Banking Portal](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)

## 🚀 Quick Start with Docker (Recommended)

Get started in 5 minutes! See [QUICKSTART.md](QUICKSTART.md)

```bash
# Setup environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# Build and run
docker-compose up -d --build

# Seed database (first time only)
docker exec -it portal_backend npm run seed

# Access: http://localhost:3000
# Login: admin@bank.com / [Check .env for password]
```

📖 **Full Docker Guide**: [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## �📋 Table of Contents

- [Quick Start with Docker](#-quick-start-with-docker-recommended)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [User Roles and Permissions](#-user-roles-and-permissions)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security Features](#-security-features)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & Authorization

- **Role-based access control** (Admin, Sales Manager, Sales)
- **Secure JWT authentication** with Access & Refresh Token mechanism
- **Password strength validation** with comprehensive requirements
- **Admin account management** with user creation capabilities
- **Rate limiting** to prevent brute force attacks

### 👥 Customer Management

- **Advanced filtering system** with multiple criteria (job, marital status, education, housing)
- **Real-time search** across customer names, phone numbers, and job titles
- **Probability score analysis** with min/max filtering
- **Bulk assignment** capabilities for Managers to distribute leads efficiently
- **Call logging system** to track interaction history with customers
- **Dynamic statistics** that update based on applied filters
- **Responsive data tables** with pagination support

### 📊 Analytics & Insights

- **Real-time statistics dashboard** showing filtered data metrics
- **Customer probability scoring** for targeted marketing
- **Performance tracking** for sales teams
- **AI-powered conversation guides** using Google Gemini API
- **High-performance caching** using Redis to optimize response times
- **Data visualization** with intuitive card-based layout
- **ML-Powered Credit Scoring** (Python Service) for accurate lead prioritization

### 🛡️ Security

- **Environment-based configuration** for sensitive data
- **Input validation and sanitization** against XSS attacks
- **SQL injection prevention** with parameterized queries
- **CORS protection** and security headers
- **Rate limiting** for API endpoints

### 🎨 User Experience

- **Responsive design** optimized for desktop, tablet, and mobile
- **Modern UI/UX** with Tailwind CSS styling
- **Intuitive navigation** with role-based menu items
- **Real-time updates** without page refreshes
- **Loading states** and error handling

## 🛠️ Technology Stack

### Frontend

- **Next.js 16.0.1** - React framework with App Router
- **React 18** - UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Axios** - HTTP client for API requests

### Backend

- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL 14+** - Relational database
- **Redis** - In-memory data structure store for caching
- **Prisma ORM** - Database toolkit and query builder
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Joi** - Input validation
- **Google Gemini AI** - AI-powered conversation guides
- **Awilix** - Dependency injection container

### Machine Learning Service

- **Python 3.9+** - Runtime environment
- **FastAPI** - High-performance web framework
- **Scikit-learn** - Machine learning library
- **Pandas** - Data manipulation and analysis
- **Joblib** - Model serialization

### Development Tools

- **Docker & Docker Compose** - Containerization and orchestration
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **Nodemon** - Auto-reload for backend development

## 📋 Prerequisites

**Option 1: Docker (Recommended)**

- Docker 20.10+
- Docker Compose 2.0+

**Option 2: Local Development**

- Node.js 18.0.0 or higher
- PostgreSQL 14 or higher
- Redis Server
- npm or yarn package manager
- Git for version control

## 🚀 Installation

### Option 1: Docker Setup (Recommended - 5 Minutes)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/banking-portal.git
cd banking-portal

# 2. Setup environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# 3. Build and start all services
docker-compose up -d --build

# 4. Seed database (first time only)
docker exec -it portal_backend npm run seed

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Login: admin@bank.com / [Check .env for password]
```

📖 **Full Docker Guide**: See [DOCKER_SETUP.md](DOCKER_SETUP.md) and [QUICKSTART.md](QUICKSTART.md)

### Option 2: Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/banking-portal.git
cd banking-portal
```

#### 2. Install Dependencies

**Backend Dependencies:**

```bash
cd backend
npm install
```

**Frontend Dependencies:**

```bash
cd ../frontend
npm install
```

#### 3. Environment Configuration

**Backend Environment:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server
PORT=8000
NODE_ENV=development

# Database (adjust for your local PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/portal_banking

# JWT Configuration
JWT_SECRET=your-super-secure-random-jwt-secret-here-min-32-chars
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12

# Gemini AI (get from https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key-here

# Seed User Credentials
ADMIN_EMAIL=
ADMIN_PASSWORD=
SALES_EMAIL=
SALES_PASSWORD=
```

**Frontend Environment:**

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NODE_ENV=development
```

## 🗄️ Database Setup (Local Development Only)

### 1. Create Database

```bash
# Using PostgreSQL CLI
createdb portal_banking

# Or using pgAdmin interface
# Create database named "portal_banking"
```

### 2. Run Database Migrations

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

### 3. Seed Database with Sample Data

```bash
cd backend
npm run seed
```

This will create:

- **2 default users** (Admin and Sales)
- **41,188 customer records** with comprehensive data
- **Probability scores** for customer analysis

## 🏃‍♂️ Running the Application

### Docker (Hot Reload Enabled)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access Prisma Studio (Database UI)
docker exec -it portal_backend npx prisma studio
# Open: http://localhost:5555
```

**Services:**

- **Frontend**: http://localhost:3000 (Next.js with Fast Refresh)
- **Backend**: http://localhost:8000/api (Express with nodemon)
- **ML Service**: http://localhost:5000 (FastAPI)
- **Database**: localhost:5433 (PostgreSQL)

**Hot Reload:**

- ✅ Backend code changes in `backend/src/` → auto-restart
- ✅ Frontend code changes in `frontend/app/`, `frontend/components/` → auto-reload
- ✅ Database schema changes in `backend/prisma/schema.prisma` → run migration manually

### Local Development (Without Docker)

#### Backend Server (Terminal 1)

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:8000`

#### Frontend Server (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Access the Application

**With Docker:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Database**: localhost:5433
- **Default Login**: admin@bank.com / [Check .env for password]

**Local Development:**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Database**: localhost:5432
- **Default Login**: admin@bank.com / [Check .env for password]

## 👥 User Roles and Permissions

### 🔵 ADMIN

- **Full system access** to all features
- **User management**: Create, view all user accounts
- **Customer data**: View and analyze all customer records
- **System configuration**: Admin panel access
- **Default credentials**: admin@bank.com / [Your configured password]

### 🟡 SALES MANAGER

- **Customer management**: View all customer records
- **Analytics**: Access to performance metrics and reports
- **Team oversight**: Monitor sales team performance
- **Data filtering**: Advanced filtering capabilities

### 🟢 SALES

- **Customer access**: View assigned and unassigned customers
- **Search functionality**: Find customers by various criteria
- **Basic analytics**: View customer probability scores
- **Dashboard access**: Personal performance metrics

## 📚 API Documentation

Dokumentasi API lengkap tersedia di **[API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)**.

Berikut adalah ringkasan endpoint utama:

### Authentication Endpoints

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@bank.com",
  "password": "YourSecurePassword123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@bank.com",
      "role": "ADMIN",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Register User (Admin Only)

```http
POST /api/auth/register/admin
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "newsales@bank.com",
  "password": "SecurePassword123!",
  "role": "SALES"
}
```

#### Get All Users (Admin Only)

```http
GET /api/auth/users
Authorization: Bearer <admin-token>
```

### Customer Management Endpoints

#### Get Customers (with Filtering)

```http
GET /api/customers?page=1&limit=20&search=john&minScore=0.5&job=technician
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20, max: 100)
- `search`: Search term for name, phone, or job
- `minScore`: Minimum probability score (0.0 - 1.0)
- `maxScore`: Maximum probability score (0.0 - 1.0)
- `job`: Filter by job title
- `marital`: Filter by marital status
- `education`: Filter by education level
- `housing`: Filter by housing status
- `sortBy`: Sort field (name, score, createdAt, age)
- `sortOrder`: Sort direction (asc, desc)

**Response:**

```json
{
  "customers": [
    {
      "id": 1,
      "originalId": 1,
      "name": "John Doe",
      "phoneNumber": "+1234567890",
      "score": 0.85,
      "age": 35,
      "job": "technician",
      "marital": "married",
      "education": "high.school",
      "housing": "yes"
      // ... more customer fields
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2060,
    "totalCustomers": 41188,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Get Customer Details

```http
GET /api/customers/123
Authorization: Bearer <token>
```

#### Get Filter Options

```http
GET /api/customers/filters/options
Authorization: Bearer <token>
```

**Response:**

```json
{
  "jobOptions": ["admin", "technician", "services", "management"],
  "maritalOptions": ["married", "single", "divorced", "unknown"],
  "educationOptions": ["high.school", "university.degree", "illiterate"],
  "housingOptions": ["yes", "no", "unknown"],
  "scoreRange": {
    "min": 0.0,
    "max": 1.0,
    "avg": 0.425
  }
}
```

### Other Available Endpoints

Selain endpoint di atas, API juga menyediakan:

| Kategori      | Endpoint                                  | Deskripsi                      |
| ------------- | ----------------------------------------- | ------------------------------ |
| **Call Logs** | `POST /api/call-logs`                     | Buat log panggilan             |
|               | `GET /api/call-logs`                      | Lihat semua log panggilan      |
|               | `GET /api/call-logs/statistics`           | Statistik panggilan            |
|               | `GET /api/call-logs/team-statistics`      | Statistik tim (Manager/Admin)  |
|               | `GET /api/call-logs/top-performers`       | Top performers (Manager/Admin) |
| **AI Guide**  | `GET /api/conversation-guide/:customerId` | Panduan percakapan AI          |
| **Auth**      | `POST /api/auth/refresh`                  | Refresh access token           |
|               | `POST /api/auth/logout`                   | Logout user                    |
|               | `POST /api/auth/change-password`          | Ganti password                 |

📖 **Dokumentasi API Lengkap**: Lihat [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) untuk detail lengkap termasuk request/response body, rate limiting, error codes, dan authorization matrix.

## 📁 Project Structure

```
banking-portal/
├── frontend/                     # Next.js frontend application
│   ├── app/                    # App Router pages
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── admin/             # Admin pages
│   │   └── customer/          # Customer detail pages
│   ├── components/            # React components
│   │   ├── LoginForm.js       # Login form component
│   │   ├── RegisterForm.js    # Registration form
│   │   ├── UserManagement.js  # User management
│   │   └── CustomerTable.js   # Customer data table
│   ├── contexts/              # React contexts
│   │   └── AuthContext.js     # Authentication context
│   └── package.json
├── backend/                     # Express.js backend API
│   ├── src/
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # Authentication middleware
│   │   │   ├── validation.js  # Input validation
│   │   │   └── errorHandler.js # Error handling
│   │   ├── routes/            # API routes
│   │   │   ├── auth.js        # Authentication endpoints
│   │   │   └── customers.js   # Customer management
│   │   └── app.js             # Express app configuration
│   ├── prisma/                # Database schema and migrations
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Database seeding
│   └── package.json
├── ml-service/                  # Python FastAPI ML Service
│   ├── model/                 # Serialized ML models
│   │   └── credit_scoring_model.pkl
│   ├── main.py                # FastAPI application entry point
│   ├── Dockerfile             # Docker configuration
│   └── requirements.txt       # Python dependencies
├── .gitignore                   # Git ignore file
├── README.md                    # This file
```

## 🔒 Security Features

### Authentication & Authorization

- **JWT-based authentication** with configurable expiration
- **Role-based access control** (RBAC)
- **Password strength requirements** (8+ chars, uppercase, lowercase, numbers, special chars)
- **Secure password hashing** with bcrypt (12 rounds)

### Data Protection

- **Input validation and sanitization** using Joi
- **SQL injection prevention** with Prisma ORM
- **XSS protection** with input sanitization
- **CORS configuration** for cross-origin requests

### Environment Security

- **Environment variables** for sensitive configuration
- **No hardcoded credentials** in source code
- **Development-only credential display** with feature flags
- **Comprehensive .gitignore** for sensitive files

### API Security

- **Rate limiting** on authentication endpoints
- **Request validation** for all API inputs
- **Error handling** without sensitive data exposure
- **Security headers** implementation

## 🔧 Development

### Code Style and Standards

```bash
# Install code formatting tools
npm install -g prettier eslint

# Format code
npx prettier --write .

# Lint code
npx eslint .
```

### Environment Setup

```bash
# For development with test credentials
NEXT_PUBLIC_SHOW_TEST_CREDENTIALS=true

# Production environment
NODE_ENV=production
NEXT_PUBLIC_SHOW_TEST_CREDENTIALS=false
```

### Database Operations

```bash
# Reset database completely
cd backend
npx prisma migrate reset --force
npm run seed

# View database schema
npx prisma studio

# Generate Prisma client
npx prisma generate
```

## 🧪 Testing

### Frontend Testing

```bash
cd frontend
npm test                    # Run tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Backend Testing

```bash
cd backend
npm test                    # Run tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Manual Testing Checklist

- [ ] User login with different roles
- [ ] Role-based access control
- [ ] Customer data filtering and search
- [ ] Admin user management
- [ ] Password validation
- [ ] API endpoint security
- [ ] Responsive design testing
- [ ] Error handling and loading states

## 🚀 Deployment

### Environment Variables for Production

```env
# Backend
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret-min-32-chars
DATABASE_URL=postgresql://user:pass@host:5432/prod_db
GEMINI_API_KEY=your-production-gemini-api-key
ADMIN_PASSWORD=secure-production-password
CORS_ORIGIN=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NODE_ENV=production
```

### Docker Production Deployment

```bash
# Build for production
docker-compose -f docker-compose.prod.yml up -d --build

# Or use individual Dockerfiles
cd backend
docker build -t banking-portal-backend --target production .

cd ../frontend
docker build -t banking-portal-frontend --target production .
```

### Local Build Commands

```bash
# Frontend build
cd frontend
npm run build
npm start

# Backend production setup
cd backend
npm ci --only=production
npm start
```

### Production Checklist

- [ ] Update all environment variables
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (min 32 chars)
- [ ] Configure proper `CORS_ORIGIN`
- [ ] Enable SSL/TLS for database connection
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Use production-grade secrets management
- [ ] Enable rate limiting
- [ ] Set up CDN for static assets (optional)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Requirements

- **Follow** the existing code style
- **Write** clear commit messages
- **Add** tests for new features
- **Update** documentation as needed
- **Ensure** all tests pass

### Security Guidelines

- **Never** commit sensitive data or credentials
- **Use** environment variables for configuration
- **Follow** security best practices
- **Report** security vulnerabilities privately

### Code Review Process

1. **Automated checks**: ESLint, tests pass
2. **Manual review**: Code quality and functionality
3. **Security review**: Authentication and authorization
4. **Integration testing**: Verify no breaking changes

### Common Issues

#### Docker Issues

```bash
# Container won't start
docker-compose down
docker-compose up --build --force-recreate

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Reset everything (⚠️ will delete data!)
docker-compose down -v
docker system prune -a
```

#### Database Connection Issues

```bash
# Docker: Check database health
docker-compose ps
docker exec -it portal_db psql -U user -d portal_banking

# Local: Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -p 5433 -U user -d portal_banking  # Docker
psql -h localhost -p 5432 -U user -d portal_banking  # Local
```

#### Port Conflicts

```bash
# Check which ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :5433

# Docker: Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
  - "5434:5432"  # Database

# Kill processes if needed
kill -9 <PID>
```

#### Hot Reload Not Working (Docker)

```bash
# Linux: Increase file watchers limit
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart containers
docker-compose restart backend frontend
```

#### Environment Variable Issues

```bash
# Docker: Check if .env file is loaded
docker exec -it portal_backend printenv | grep GEMINI_API_KEY

# Local: Check environment variables
printenv | grep -E "JWT_SECRET|DATABASE_URL|NODE_ENV|GEMINI_API_KEY"

# Reload environment (Docker)
docker-compose down
docker-compose up -d

# Source environment file (Local)
source backend/.env
```

#### Gemini API Issues

```bash
# Verify API key is set
docker exec -it portal_backend printenv | grep GEMINI_API_KEY

# Test API key manually
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=YOUR_API_KEY"
```

#### Migration Issues

```bash
# Docker: Reset migrations
docker exec -it portal_backend npx prisma migrate reset

# Local: Reset migrations
cd backend
npx prisma migrate reset

# Force deploy migrations
npx prisma migrate deploy
```
