# Backend Architecture Documentation

## 📁 Struktur Direktori

```
backend/
├── src/
│   ├── config/                 # Configuration Layer
│   │   ├── index.js           # Main configuration & environment validation
│   │   ├── database.js        # Database connection & health checks
│   │   └── jwt.js             # JWT token generation & verification
│   │
│   ├── repositories/          # Repository Layer (Data Access)
│   │   ├── userRepository.js      # User data access methods
│   │   └── customerRepository.js  # Customer data access methods
│   │
│   ├── services/              # Service Layer (Business Logic)
│   │   ├── authService.js         # Authentication & user management logic
│   │   └── customerService.js     # Customer management logic
│   │
│   ├── controllers/           # Controller Layer (Request Handling)
│   │   ├── authController.js      # Auth HTTP request handlers
│   │   └── customerController.js  # Customer HTTP request handlers
│   │
│   ├── middleware/            # Middleware
│   │   ├── auth.js               # Authentication & authorization
│   │   ├── errorHandler.js       # Global error handling
│   │   └── validation.js         # Request validation
│   │
│   ├── routes/                # Route Definitions
│   │   ├── auth.js               # Auth routes
│   │   └── customers.js          # Customer routes
│   │
│   ├── container.js           # Dependency Injection Container
│   └── index.js               # Application entry point
│
├── prisma/                    # Database
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.js              # Database seeding
│
├── .env                      # Environment variables
├── package.json
└── Dockerfile
```

## 🏗️ Arsitektur Layer

### 1. Configuration Layer (`src/config/`)

**Tanggung Jawab:**

- Mengelola konfigurasi aplikasi
- Validasi environment variables
- Menyediakan pengaturan terpusat

**File:**

- `index.js`: Konfigurasi utama (server, database, JWT, CORS, security)
- `database.js`: Singleton Prisma Client, koneksi database
- `jwt.js`: Utilitas JWT (generate, verify, decode token)

**Best Practices:**
✅ Single source of truth untuk semua konfigurasi
✅ Validasi environment variables saat startup
✅ Type-safe configuration dengan default values

---

### 2. Repository Layer (`src/repositories/`)

**Tanggung Jawab:**

- Data access layer (interaksi dengan database)
- Query abstraction
- Raw database operations

**Prinsip:**

- Satu repository per entity/model
- Method naming yang jelas (findById, findByEmail, create, update, delete)
- Tidak ada business logic di repository
- Return raw data dari database

**Contoh Method:**

```javascript
// userRepository.js
async findByEmail(email)
async create(userData)
async update(id, updateData)
async delete(id)
```

**Best Practices:**
✅ Fokus pada data access saja
✅ Tidak ada validasi business logic
✅ Reusable dan testable

---

### 3. Service Layer (`src/services/`)

**Tanggung Jawab:**

- Business logic
- Data validation
- Authorization checks
- Orchestration antara multiple repositories

**Prinsip:**

- Satu service per domain/feature
- Menggunakan repository untuk data access
- Throw custom errors (ConflictError, NotFoundError, dll)
- Tidak langsung handle HTTP request/response

**Contoh Method:**

```javascript
// authService.js
async register(userData)      // Business logic: validation + hashing + create
async login(credentials)      // Business logic: verify + generate token
async changePassword(userId, oldPass, newPass)
```

**Best Practices:**
✅ Pure business logic, tidak ada HTTP handling
✅ Testable tanpa HTTP request
✅ Dependency injection via constructor
✅ Throw custom errors yang descriptive

---

### 4. Controller Layer (`src/controllers/`)

**Tanggung Jawab:**

- Handle HTTP requests/responses
- Extract data dari request (body, params, query)
- Call service methods
- Format response

**Prinsip:**

- Satu controller per route group
- Thin controllers (delegasi ke service)
- Wrap dengan asyncHandler untuk error handling
- Return HTTP responses

**Contoh Method:**

```javascript
// authController.js
register = asyncHandler(async (req, res) => {
  const result = await this.authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});
```

**Best Practices:**
✅ Minimal logic, hanya HTTP handling
✅ Delegate semua business logic ke service
✅ Consistent response format
✅ Proper HTTP status codes

---

### 5. Dependency Injection Container (`src/container.js`)

**Tanggung Jawab:**

- Inisialisasi semua dependencies
- Manage lifecycle dependencies
- Provide dependency lookup

**Prinsip:**

- Singleton pattern untuk container
- Initialize dependencies dalam urutan yang benar
- Provide getter methods untuk type safety

**Best Practices:**
✅ Single instance per dependency
✅ Clear dependency tree
✅ Easy testing dengan mock container
✅ Type-safe dengan getter methods

---

## 🔄 Request Flow

```
1. HTTP Request
   ↓
2. Express Route (src/routes/)
   ↓
3. Middleware (auth, validation)
   ↓
4. Controller (src/controllers/)
   - Extract request data
   - Call service method
   ↓
5. Service (src/services/)
   - Business logic
   - Validation
   - Authorization
   - Call repository
   ↓
6. Repository (src/repositories/)
   - Database query
   - Return raw data
   ↓
7. Service
   - Process data
   - Return to controller
   ↓
8. Controller
   - Format response
   ↓
9. HTTP Response
```

---

## 📦 Dependency Graph

```
Container
  ├─ PrismaClient (singleton)
  │
  ├─ Repositories
  │   ├─ UserRepository(prismaClient)
  │   └─ CustomerRepository(prismaClient)
  │
  ├─ Services
  │   ├─ AuthService(userRepository)
  │   └─ CustomerService(customerRepository, userRepository)
  │
  └─ Controllers
      ├─ AuthController(authService)
      └─ CustomerController(customerService)
```

---

## 🎯 Best Practices yang Diimplementasikan

### 1. Separation of Concerns

- Setiap layer memiliki tanggung jawab yang jelas
- Tidak ada mixing antara HTTP logic dan business logic

### 2. Dependency Injection

- Loose coupling antara komponen
- Mudah untuk testing (dapat inject mock dependencies)
- Flexible untuk perubahan

### 3. Error Handling

- Custom error classes untuk different scenarios
- Centralized error handling di middleware
- Consistent error response format

### 4. Configuration Management

- Single source of truth di config layer
- Environment validation saat startup
- Type-safe configuration

### 5. Security

- JWT dengan proper secret validation
- Bcrypt dengan configurable salt rounds
- Role-based access control (RBAC)
- Input validation dengan Joi

### 6. Code Organization

- Consistent file naming
- Clear module boundaries
- Easy to navigate dan maintain

### 7. Scalability

- Easy to add new features
- Clear extension points
- Modular architecture

---

## 🧪 Testing Strategy

### Unit Tests

- **Repositories**: Mock Prisma Client
- **Services**: Mock Repositories
- **Controllers**: Mock Services

### Integration Tests

- Test dengan real database (test database)
- Test complete request flow

### Example:

```javascript
// Testing Service
const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const authService = new AuthService(mockUserRepository);
// Test authService methods
```

---

## 🚀 Migration dari Kode Lama

### Perubahan Utama:

1. **Routes**: Sekarang hanya define routes, delegate ke controllers
2. **Controllers**: Baru dibuat, handle HTTP logic
3. **Services**: Business logic dipindah dari routes ke services
4. **Repositories**: Data access logic dipindah ke repositories
5. **Config**: Konfigurasi dipindah ke config layer
6. **Container**: Dependency injection untuk manage semua instances

### Keuntungan:

✅ **Maintainability**: Kode lebih terorganisir dan mudah dipahami
✅ **Testability**: Setiap layer dapat ditest secara independen
✅ **Scalability**: Mudah menambah fitur baru
✅ **Reusability**: Service dan repository dapat digunakan di berbagai tempat
✅ **Separation of Concerns**: Setiap layer fokus pada tanggung jawabnya
✅ **Industry Standard**: Mengikuti best practices yang umum digunakan

---

## 📝 Cara Menambah Fitur Baru

### Example: Menambah fitur "Product"

1. **Buat Prisma Model** (`prisma/schema.prisma`)

```prisma
model Product {
  id    Int     @id @default(autoincrement())
  name  String
  price Float
}
```

2. **Buat Repository** (`src/repositories/productRepository.js`)

```javascript
class ProductRepository {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }

  async findAll() {
    /* ... */
  }
  async findById(id) {
    /* ... */
  }
  async create(data) {
    /* ... */
  }
}
```

3. **Buat Service** (`src/services/productService.js`)

```javascript
class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async getProducts() {
    /* business logic */
  }
  async createProduct(data) {
    /* business logic */
  }
}
```

4. **Buat Controller** (`src/controllers/productController.js`)

```javascript
class ProductController {
  constructor(productService) {
    this.productService = productService;
  }

  getProducts = asyncHandler(async (req, res) => {
    const products = await this.productService.getProducts();
    res.json({ success: true, data: products });
  });
}
```

5. **Update Container** (`src/container.js`)

```javascript
this.dependencies.productRepository = new ProductRepository(prismaClient);
this.dependencies.productService = new ProductService(productRepository);
this.dependencies.productController = new ProductController(productService);
```

6. **Buat Routes** (`src/routes/products.js`)

```javascript
const router = express.Router();
const productController = container.getProductController();

router.get("/", productController.getProducts);
router.post("/", productController.createProduct);

module.exports = router;
```

7. **Register Route** (`src/index.js`)

```javascript
const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);
```

---

## 🔒 Environment Variables

Pastikan `.env` memiliki:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# JWT
JWT_SECRET="your-very-secure-secret-key-at-least-32-characters"
JWT_EXPIRES_IN="7d"

# Security
BCRYPT_SALT_ROUNDS=12

# CORS
CORS_ORIGIN="*"
```

---

## 📚 Resources

- [Layered Architecture Pattern](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)
- [Dependency Injection in Node.js](https://blog.risingstack.com/dependency-injection-in-node-js/)
- [Repository Pattern](https://deviq.com/design-patterns/repository-pattern)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)

---

Refactoring selesai! Backend sekarang mengikuti **Layer Architecture** yang clean dan maintainable. 🎉
