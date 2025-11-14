# Portal Banking - Development Guide

## 🔐 **IMPORTANT SECURITY NOTES**

### **Credential Management**

- **NEVER** commit `.env` files to version control
- Use strong, unique passwords for production
- Change default passwords immediately
- Environment variables are your friend!

### **Test Credentials (Development Only)**

Test credentials are **NOT** exposed in production UI. To enable them in development:

```bash
# Set environment variable
NEXT_PUBLIC_SHOW_TEST_CREDENTIALS=true
```

Default development accounts (only visible when `SHOW_TEST_CREDENTIALS=true`):

- **Admin**: `admin@bank.com`
- **Sales**: `sales@bank.com`

> **⚠️ WARNING**: Passwords are not shown in UI. Check your `.env` file or ask your team lead.

## 🚀 **Quick Start**

### **1. Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Edit with your credentials
nano .env
```

**Required Environment Variables:**

```env
JWT_SECRET=your-super-secure-random-jwt-secret-here
DATABASE_URL=postgresql://username:password@localhost:5433/portal_banking
ADMIN_EMAIL=admin@bank.com
ADMIN_PASSWORD=Admin123!
```

### **2. Installation**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### **3. Database Setup**

```bash
cd backend
npx prisma migrate dev --name init
npm run seed
```

### **4. Start Development**

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

## 🛡️ **Security Best Practices**

### **Development Environment**

1. **Use environment variables** for all sensitive data
2. **Don't hardcode credentials** in source code
3. **Test with different roles** (admin, sales, sales_manager)
4. **Verify authentication** on all protected routes

### **Password Requirements**

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%\*?&)

### **Role-Based Access**

- **ADMIN**: Full access + user management
- **SALES_MANAGER**: Dashboard + customer data
- **SALES**: Assigned customers only (currently all customers for development)

## 🐛 **Common Issues**

### **"No customers found" for sales**

- Check customer API endpoint permissions
- Verify role-based access logic in `backend/src/routes/customers.js`
- Sales can see unassigned customers during development

### **JWT errors**

- Verify `JWT_SECRET` is set in `.env`
- Check token expiration (default: 7 days)
- Ensure proper auth middleware usage

### **Database connection issues**

- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Ensure database exists: `createdb portal_banking`

## 📝 **Development Workflow**

### **1. Feature Development**

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes...
# Test thoroughly...

# Commit and push
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

### **2. Security Checklist Before Commit**

- [ ] No hardcoded passwords/API keys
- [ ] Environment variables used for sensitive data
- [ ] `.env` not accidentally staged
- [ ] Test credentials not exposed in production code
- [ ] Authentication/authorization properly implemented

### **3. Testing**

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Manual testing checklist:
# - Admin login and user management
# - Sales login and customer access
# - Role-based navigation
# - Password validation
# - API endpoint security
```

## 📚 **API Documentation**

### **Authentication Endpoints**

```
POST /api/auth/login      - User login
POST /api/auth/register   - Create new user (admin only)
GET  /api/auth/users      - List users (admin only)
```

### **Customer Endpoints**

```
GET /api/customers           - List customers (with filters)
GET /api/customers/:id       - Customer details
GET /api/customers/filters/options - Filter options
```

## 🔧 **Troubleshooting**

### **Seed Script Issues**

```bash
# Reset database completely
cd backend
npx prisma migrate reset --force
npm run seed
```

### **Environment Variable Debug**

```bash
# Check if variables are loaded
cd frontend && npm run dev
# In browser console: console.log(process.env)
```

### **Authentication Debug**

```bash
# Check JWT token
# In browser dev tools -> Application -> Local Storage
# Look for 'token' and 'user' items
```

## 📞 **Support**

For security-related issues or questions:

1. Check this documentation first
2. Review code for credential exposure
3. Consult with your team lead
4. Follow security best practices

---

**Remember: Security is everyone's responsibility! 🛡️**
