# 🏦 Banking Portal - Customer Management System

A modern, secure web-based customer relationship management (CRM) platform designed specifically for banking sales teams to manage customer data, track sales performance, and analyze customer probability scores.

![Banking Portal](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)

## 📋 Table of Contents

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
- **Secure JWT authentication** with configurable expiration
- **Password strength validation** with comprehensive requirements
- **Admin account management** with user creation capabilities

### 👥 Customer Management
- **Advanced filtering system** with multiple criteria (job, marital status, education, housing)
- **Real-time search** across customer names, phone numbers, and job titles
- **Probability score analysis** with min/max filtering
- **Dynamic statistics** that update based on applied filters
- **Responsive data tables** with pagination support

### 📊 Analytics & Insights
- **Real-time statistics dashboard** showing filtered data metrics
- **Customer probability scoring** for targeted marketing
- **Performance tracking** for sales teams
- **Data visualization** with intuitive card-based layout

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
- **PostgreSQL** - Database
- **Prisma** - ORM and database toolkit
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Joi** - Input validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📋 Prerequisites

- **Node.js 18.0.0 or higher**
- **PostgreSQL 14 or higher**
- **npm or yarn package manager**
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/banking-portal.git
cd banking-portal
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Environment Configuration

#### Copy Environment Template
```bash
cp .env.example .env
```

#### Configure Environment Variables
Edit the `.env` file with your configuration:

```env
# JWT Configuration
JWT_SECRET=your-super-secure-random-jwt-secret-here-min-32-chars

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5433/portal_banking

# Seed User Credentials
ADMIN_EMAIL=admin@bank.com
ADMIN_PASSWORD=YourSecurePassword123!
SALES_EMAIL=sales@bank.com
SALES_PASSWORD=YourSecurePassword123!

# Frontend Development
NEXT_PUBLIC_SHOW_TEST_CREDENTIALS=false
```

## 🗄️ Database Setup

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
npx prisma migrate dev --name init
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

### Start Development Servers

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
- **Frontend Application**: http://localhost:3000
- **API Endpoints**: http://localhost:8000/api
- **Database**: localhost:5433

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
      "housing": "yes",
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
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore file
├── README.md                    # This file
└── README-DEV.md               # Development guide
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
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
DATABASE_URL=postgresql://user:pass@host:5433/prod_db
ADMIN_PASSWORD=secure-production-password
NEXT_PUBLIC_SHOW_TEST_CREDENTIALS=false
```

### Build Commands
```bash
# Frontend build
cd frontend
npm run build

# Backend production setup
cd backend
npm start
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

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

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and `README-DEV.md`
- **Issues**: Create an issue on GitHub
- **Security**: Report security issues privately
- **Community**: Join our discussions

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -h localhost -p 5433 -U username -d portal_banking
```

#### Port Conflicts
```bash
# Check which ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Kill processes if needed
kill -9 <PID>
```

#### Environment Variable Issues
```bash
# Check environment variables
printenv | grep -E "JWT_SECRET|DATABASE_URL|NODE_ENV"

# Source environment file
source .env
```

## 🔄 Version History

### v1.0.0 (Current)
- ✅ **Initial release** with core CRM functionality
- ✅ **Role-based authentication** system
- ✅ **Customer data management** with filtering
- ✅ **Real-time statistics** dashboard
- ✅ **Admin user management** features
- ✅ **Security implementation** with validation
- ✅ **Responsive design** for all devices

### Upcoming Features
- 🔄 **Customer assignment** system for sales teams
- 🔄 **Advanced analytics** and reporting
- 🔄 **Email notifications** for important events
- 🔄 **Data export** functionality
- 🔄 **Audit logging** for compliance
- 🔄 **Mobile application** support

---

**Built with ❤️ for modern banking sales teams**

**Connect with us**: [GitHub](https://github.com/your-username/banking-portal) | [Issues](https://github.com/your-username/banking-portal/issues) | [Discussions](https://github.com/your-username/banking-portal/discussions)