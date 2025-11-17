# Portal Banking Frontend

Modern web application untuk manajemen nasabah bank, dibangun dengan Next.js, Shadcn/UI, dan Tailwind CSS.

## 🚀 Fitur Utama

### 🔐 Authentication

- Login system dengan JWT
- Role-based access control (ADMIN, SALES_MANAGER, SALES)
- Auto redirect berdasarkan status login

### 📊 Dashboard

- **Statistik Real-time:**
  - Total Nasabah
  - Skor Tertinggi
  - Rata-rata Skor
- **Filter Nasabah:**
  - Search by name, phone, job
  - Filter by job, marital status, education, housing
  - Score range filter
  - Sorting options
- **Tabel Nasabah:**
  - Pagination
  - Display customer details
  - Show assigned sales

### 👥 User Management (Admin Only)

- Create new user accounts
- Assign roles (ADMIN, SALES_MANAGER, SALES)
- View all users
- Delete users

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Components:** Shadcn/UI
- **Styling:** Tailwind CSS
- **Data Fetching:** SWR
- **Authentication:** JWT with Context API
- **Icons:** Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🔧 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── (dashboard)/          # Protected routes with layout
│   │   ├── admin/
│   │   │   └── users/        # User management page
│   │   ├── customers/        # Customers page
│   │   ├── dashboard/        # Main dashboard
│   │   └── layout.js         # Dashboard layout with sidebar
│   ├── login/                # Login page
│   ├── layout.js             # Root layout with AuthProvider
│   ├── page.js               # Home page (redirects)
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/
│   │   ├── CustomerFilters.js
│   │   └── CustomerTable.js
│   ├── layout/
│   │   ├── Header.js
│   │   └── Sidebar.js
│   └── ui/                   # Shadcn UI components
├── contexts/
│   └── AuthContext.js        # Authentication context
├── lib/
│   ├── api.js                # API utility functions
│   └── utils.js              # Utility functions
└── middleware.js             # Route protection middleware
```

## 🎨 Components

### Layout Components

#### Header

- User profile dropdown
- Logout functionality
- Display current user info

#### Sidebar

- Dynamic navigation based on user role
- Active route highlighting
- Icons for better UX

### Dashboard Components

#### CustomerFilters

- Search bar
- Collapsible advanced filters
- Real-time filter application
- Filter reset functionality

#### CustomerTable

- Paginated table
- Score badges with color coding
- Customer details display
- Assigned sales information

## 🔐 Authentication Flow

1. User enters credentials on login page
2. API validates and returns JWT token
3. Token stored in localStorage
4. AuthContext manages auth state
5. Middleware protects routes
6. Auto redirect based on authentication

## 👤 User Roles & Permissions

| Feature            | ADMIN | SALES_MANAGER | SALES              |
| ------------------ | ----- | ------------- | ------------------ |
| View Dashboard     | ✅    | ✅            | ✅                 |
| View All Customers | ✅    | ✅            | ❌ (assigned only) |
| Create User        | ✅    | ❌            | ❌                 |
| Delete User        | ✅    | ❌            | ❌                 |
| Manage Users       | ✅    | ❌            | ❌                 |

## 🚦 Getting Started

### 1. Start Backend Server

Pastikan backend sudah berjalan di `http://localhost:8000`

### 2. Start Frontend

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

### 3. Login

Default credentials:

- **Email:** admin@example.com
- **Password:** SecureP@ssw0rd

## 📱 Pages

### `/login`

- Public page
- Login form
- Auto redirect if already logged in

### `/dashboard`

- Protected page
- Statistics cards
- Customer filters
- Customer table with pagination

### `/admin/users`

- Admin only
- Create new users
- View all users
- Delete users

## 🎯 Key Features Implementation

### API Integration

- Centralized API utility (`lib/api.js`)
- Auto authentication headers
- Error handling with auto logout on 401
- Type-safe API methods

### State Management

- AuthContext for global auth state
- SWR for server state & caching
- Local state for forms & filters

### Route Protection

- Middleware for page-level protection
- Component-level guards
- Role-based rendering

### UX Enhancements

- Loading states
- Error messages
- Success notifications
- Skeleton screens
- Responsive design

## 🔄 Data Flow

```
User Action → Component → API Utility → Backend API
                ↓
         SWR Cache Update
                ↓
         UI Re-render
```

## 🎨 Styling

### Tailwind Configuration

- Custom color scheme
- Responsive breakpoints
- Custom animations

### Shadcn/UI

- Accessible components
- Customizable themes
- Consistent design system

## 🐛 Troubleshooting

### "Network Error" on API calls

- Check if backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in backend

### "Unauthorized" errors

- Clear localStorage
- Login again
- Check token expiration

### Components not rendering

- Verify all Shadcn components are installed
- Check import paths
- Ensure proper file structure

## 📚 Development Tips

### Adding New Pages

1. Create page in `app/(dashboard)/` for protected routes
2. Add route to Sidebar navigation
3. Implement with SWR for data fetching

### Adding New API Endpoints

1. Add method in `lib/api.js`
2. Use in component with SWR or direct call
3. Handle errors appropriately

### Styling Components

1. Use Tailwind utility classes
2. Follow existing component patterns
3. Keep responsive design in mind

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Update `NEXT_PUBLIC_API_URL` to production backend URL.

## 📄 License

Proprietary - Internal use only

## 👨‍💻 Support

For issues and questions, contact the development team.
