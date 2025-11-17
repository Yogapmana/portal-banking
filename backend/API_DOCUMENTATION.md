# Portal Banking Backend - API Documentation

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
cd backend
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Run database migrations
npm run migrate:dev

# Seed database (optional)
npm run seed

# Start development server
npm run dev
```

### Environment Variables

Create `.env` file:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portal_banking"

# JWT
JWT_SECRET="your-very-secure-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"

# Security
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN="*"
```

---

## 📋 API Endpoints

### Base URL

```
http://localhost:8000/api
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Error description",
  "timestamp": "2025-11-17T10:00:00.000Z"
}
```

---

## 🔐 Authentication

### Register User (Admin Only)

**POST** `/api/auth/register/admin`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "role": "SALES"
}
```

**Roles:**

- `ADMIN` - Full access
- `SALES_MANAGER` - Manage customers and view reports
- `SALES` - View assigned customers only

**Response:**

```json
{
  "success": true,
  "message": "User SALES berhasil dibuat",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "SALES",
      "createdAt": "2025-11-17T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "SALES",
      "createdAt": "2025-11-17T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get All Users (Admin Only)

**GET** `/api/auth/users`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "role": "ADMIN",
      "createdAt": "2025-11-17T10:00:00.000Z"
    }
  ]
}
```

---

### Get Current User Profile

**GET** `/api/auth/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "SALES",
    "createdAt": "2025-11-17T10:00:00.000Z"
  }
}
```

---

### Change Password

**POST** `/api/auth/change-password`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "oldPassword": "OldP@ssw0rd",
  "newPassword": "NewSecureP@ssw0rd"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

---

## 👥 Customer Management

### Get All Customers

**GET** `/api/customers`

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `search` (string) - Search by name, phone, or job
- `minScore` (number) - Minimum score filter
- `maxScore` (number) - Maximum score filter
- `job` (string) - Filter by job
- `marital` (string) - Filter by marital status
- `education` (string) - Filter by education
- `housing` (string) - Filter by housing status
- `sortBy` (string) - Sort field: score, age
- `sortOrder` (string) - Sort order: asc, desc

**Example:**

```
GET /api/customers?page=1&limit=20&search=john&minScore=0.7&sortBy=score&sortOrder=desc
```

**Response:**

```json
{
  "customers": [
    {
      "id": 1,
      "originalId": 1001,
      "name": "John Doe",
      "phoneNumber": "081234567890",
      "score": 0.85,
      "age": 35,
      "job": "admin.",
      "marital": "married",
      "education": "university.degree",
      "housing": "yes",
      "loan": "no",
      "salesId": 2,
      "assignedTo": {
        "id": 2,
        "email": "sales@example.com",
        "role": "SALES"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCustomers": 200,
    "limit": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "stats": {
    "totalCustomers": 200,
    "totalWithScores": 180,
    "avgScore": 0.65,
    "maxScore": 0.95,
    "minScore": 0.15,
    "scoreCount": 180
  }
}
```

---

### Get Customer by ID

**GET** `/api/customers/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": 1,
  "originalId": 1001,
  "name": "John Doe",
  "phoneNumber": "081234567890",
  "score": 0.85,
  "age": 35,
  "job": "admin.",
  "marital": "married",
  "education": "university.degree",
  "housing": "yes",
  "loan": "no",
  "contact": "cellular",
  "month": "may",
  "dayOfWeek": "mon",
  "duration": 261,
  "campaign": 1,
  "pdays": 999,
  "previous": 0,
  "poutcome": "nonexistent",
  "empVarRate": 1.1,
  "consPriceIdx": 93.994,
  "consConfIdx": -36.4,
  "euribor3m": 4.857,
  "nrEmployed": 5191.0,
  "salesId": 2,
  "assignedTo": {
    "id": 2,
    "email": "sales@example.com",
    "role": "SALES"
  }
}
```

---

### Get Filter Options

**GET** `/api/customers/filters/options`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "jobOptions": ["admin.", "blue-collar", "technician", "services", ...],
  "maritalOptions": ["married", "single", "divorced"],
  "educationOptions": ["university.degree", "high.school", "basic.9y", ...],
  "housingOptions": ["yes", "no", "unknown"],
  "scoreRange": {
    "min": 0.05,
    "max": 0.95,
    "avg": 0.65
  }
}
```

---

### Assign Customer to Sales (Admin/Manager Only)

**POST** `/api/customers/:id/assign`

**Headers:**

```
Authorization: Bearer <admin_or_manager_token>
```

**Request Body:**

```json
{
  "salesId": 2
}
```

**Response:**

```json
{
  "success": true,
  "message": "Customer berhasil di-assign",
  "data": {
    "id": 1,
    "name": "John Doe",
    "salesId": 2,
    "assignedTo": {
      "id": 2,
      "email": "sales@example.com",
      "role": "SALES"
    }
  }
}
```

---

### Unassign Customer (Admin/Manager Only)

**POST** `/api/customers/:id/unassign`

**Headers:**

```
Authorization: Bearer <admin_or_manager_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Customer berhasil di-unassign",
  "data": {
    "id": 1,
    "name": "John Doe",
    "salesId": null
  }
}
```

---

### Get Customer Count by Sales (Admin/Manager Only)

**GET** `/api/customers/sales/:salesId/count`

**Headers:**

```
Authorization: Bearer <admin_or_manager_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "salesId": 2,
    "count": 25
  }
}
```

---

### Create Customer (Admin/Manager Only)

**POST** `/api/customers`

**Headers:**

```
Authorization: Bearer <admin_or_manager_token>
```

**Request Body:**

```json
{
  "originalId": 5001,
  "name": "Jane Smith",
  "phoneNumber": "081298765432",
  "score": 0.75,
  "age": 28,
  "job": "technician",
  "marital": "single",
  "education": "university.degree",
  "housing": "yes",
  "loan": "no",
  "contact": "cellular",
  "month": "jun",
  "dayOfWeek": "tue",
  "duration": 180,
  "campaign": 2,
  "pdays": 999,
  "previous": 0,
  "poutcome": "nonexistent",
  "empVarRate": 1.1,
  "consPriceIdx": 93.994,
  "consConfIdx": -36.4,
  "euribor3m": 4.857,
  "nrEmployed": 5191.0
}
```

**Response:**

```json
{
  "success": true,
  "message": "Customer berhasil dibuat",
  "data": { ... }
}
```

---

### Update Customer

**PUT** `/api/customers/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Jane Smith Updated",
  "phoneNumber": "081298765999"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Customer berhasil diupdate",
  "data": { ... }
}
```

**Note:** SALES can only update their assigned customers.

---

### Delete Customer (Admin Only)

**DELETE** `/api/customers/:id`

**Headers:**

```
Authorization: Bearer <admin_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Customer berhasil dihapus"
}
```

---

## 🔒 Authorization Matrix

| Endpoint                     | ADMIN    | SALES_MANAGER | SALES              |
| ---------------------------- | -------- | ------------- | ------------------ |
| POST /auth/register/admin    | ✅       | ❌            | ❌                 |
| POST /auth/login             | ✅       | ✅            | ✅                 |
| GET /auth/users              | ✅       | ❌            | ❌                 |
| GET /auth/me                 | ✅       | ✅            | ✅                 |
| POST /auth/change-password   | ✅       | ✅            | ✅                 |
| GET /customers               | ✅ (all) | ✅ (all)      | ✅ (assigned only) |
| GET /customers/:id           | ✅       | ✅            | ✅ (if assigned)   |
| POST /customers              | ✅       | ✅            | ❌                 |
| PUT /customers/:id           | ✅       | ✅            | ✅ (if assigned)   |
| DELETE /customers/:id        | ✅       | ❌            | ❌                 |
| POST /customers/:id/assign   | ✅       | ✅            | ❌                 |
| POST /customers/:id/unassign | ✅       | ✅            | ❌                 |

---

## 🧪 Testing

### Manual Testing dengan cURL

**Login:**

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecureP@ssw0rd"}'
```

**Get Customers:**

```bash
curl -X GET "http://localhost:8000/api/customers?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman/Insomnia

1. Import collection (coming soon)
2. Set environment variable `baseUrl` = `http://localhost:8000/api`
3. Set environment variable `token` after login
4. Test all endpoints

---

## 📊 Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  role      Role     @default(SALES)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  assignedCustomers Customer[]
}

enum Role {
  ADMIN
  SALES_MANAGER
  SALES
}

model Customer {
  id           Int     @id @default(autoincrement())
  originalId   Int     @unique
  salesId      Int?
  assignedTo   User?   @relation(fields: [salesId], references: [id])

  // Customer data fields...
  name         String?
  phoneNumber  String?
  score        Float?
  age          Int
  job          String
  // ... more fields
}
```

---

## 🏗️ Architecture

Lihat [ARCHITECTURE.md](./ARCHITECTURE.md) untuk detail lengkap tentang arsitektur aplikasi.

**Layer Structure:**

```
Routes → Controllers → Services → Repositories → Database
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development mode with auto-reload
npm run dev

# Run database migrations
npm run migrate:dev

# Seed database
npm run seed

# Open Prisma Studio (database GUI)
npm run studio
```

### Code Style

- Use ES6+ features
- Async/await for asynchronous operations
- JSDoc comments for functions
- Consistent naming conventions

---

## 🐛 Error Codes

| Status Code | Error Type          | Description               |
| ----------- | ------------------- | ------------------------- |
| 400         | ValidationError     | Invalid input data        |
| 401         | AuthenticationError | Missing or invalid token  |
| 403         | AuthorizationError  | Insufficient permissions  |
| 404         | NotFoundError       | Resource not found        |
| 409         | ConflictError       | Duplicate resource        |
| 429         | RateLimitError      | Too many requests         |
| 500         | DatabaseError       | Database operation failed |
| 500         | InternalServerError | Unexpected server error   |

---

## 📝 Changelog

### Version 2.0.0 (Current)

- ✅ Refactored to layered architecture
- ✅ Added dependency injection
- ✅ Improved error handling
- ✅ Added comprehensive documentation
- ✅ Better separation of concerns

### Version 1.0.0

- Initial release with basic CRUD operations

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary and confidential.

---

## 👨‍💻 Support

For issues and questions, contact the development team.
