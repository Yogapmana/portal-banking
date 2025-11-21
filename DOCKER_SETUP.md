# 🐳 Docker Development Setup Guide

Panduan lengkap untuk menjalankan Portal Banking menggunakan Docker untuk development environment dengan hot-reload.

## 📋 Prerequisites

Pastikan sudah terinstall:

- **Docker** (versi 20.10 atau lebih baru)
- **Docker Compose** (versi 2.0 atau lebih baru)
- **Git**

Cek instalasi:

```bash
docker --version
docker-compose --version
```

## 🚀 Langkah-Langkah Setup

### 1. Clone Repository (jika belum)

```bash
git clone <repository-url>
cd portal-banking
```

### 2. Setup Environment Variables

#### Backend Environment

```bash
# Copy template environment file
cp backend/.env.example backend/.env

# Edit file .env dan isi GEMINI_API_KEY
nano backend/.env  # atau gunakan editor favorit Anda
```

Isi minimal di `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@db:5432/portal_banking"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=8000
GEMINI_API_KEY="your-gemini-api-key-here"  # ⚠️ WAJIB diisi!
```

#### Frontend Environment (Opsional)

```bash
cp frontend/.env.local.example frontend/.env.local
```

### 3. Build dan Jalankan Containers

```bash
# Build images dan start semua services
docker-compose up --build

# Atau jika ingin run di background (detached mode)
docker-compose up -d --build
```

**Proses ini akan:**

1. ✅ Build Docker images untuk backend dan frontend
2. ✅ Start PostgreSQL database
3. ✅ Menunggu database siap (health check)
4. ✅ Jalankan Prisma migrations otomatis
5. ✅ Start backend server (Express.js) di port 8000
6. ✅ Start frontend server (Next.js) di port 3000

### 4. Tunggu Sampai Services Ready

Monitor logs untuk memastikan semua service berjalan:

```bash
docker-compose logs -f
```

Tunggu sampai melihat:

- ✅ Backend: `Server running on port 8000`
- ✅ Frontend: `Ready in X ms`
- ✅ Database: `database system is ready to accept connections`

Press `Ctrl+C` untuk stop melihat logs (containers tetap berjalan jika pakai `-d`).

### 5. Seed Database (Opsional - First Time Setup)

Jika pertama kali setup, isi database dengan data sample:

```bash
# Masuk ke backend container
docker exec -it portal_backend sh

# Jalankan seed script
npm run seed

# Keluar dari container
exit
```

### 6. Akses Aplikasi

Setelah semua service ready:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Prisma Studio** (Database UI): http://localhost:5555
  ```bash
  # Buka Prisma Studio (dari dalam backend container)
  docker exec -it portal_backend npx prisma studio
  ```

**Default Login Credentials:**

- Email: `admin@bank.com`
- Password: `admin123` (atau sesuai seed data)

## 🔄 Development Workflow

### Hot Reload Aktif!

Semua perubahan code akan otomatis ter-reload tanpa perlu restart container:

- ✅ **Backend**: Perubahan di `backend/src/` akan reload Express server (nodemon)
- ✅ **Frontend**: Perubahan di `frontend/app/`, `frontend/components/`, dll akan reload Next.js (Fast Refresh)
- ✅ **Database Schema**: Perubahan di `backend/prisma/schema.prisma` perlu migration manual (lihat dibawah)

### Menjalankan Prisma Migrations

Jika mengubah `schema.prisma`:

```bash
# Masuk ke backend container
docker exec -it portal_backend sh

# Generate dan apply migration
npx prisma migrate dev --name nama_migration_anda

# Keluar
exit
```

### Melihat Logs Services

```bash
# Semua services
docker-compose logs -f

# Service tertentu
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services

```bash
# Restart semua services
docker-compose restart

# Restart service tertentu
docker-compose restart backend
docker-compose restart frontend
```

## 🛠️ Useful Commands

### Container Management

```bash
# Stop semua services
docker-compose down

# Stop dan hapus volumes (⚠️ akan hapus data database!)
docker-compose down -v

# Start services tanpa rebuild
docker-compose up

# Start di background
docker-compose up -d

# Stop services
docker-compose stop

# Start services yang sudah ada
docker-compose start
```

### Database Management

```bash
# Akses PostgreSQL CLI
docker exec -it portal_db psql -U user -d portal_banking

# Backup database
docker exec portal_db pg_dump -U user portal_banking > backup.sql

# Restore database
cat backup.sql | docker exec -i portal_db psql -U user portal_banking

# Reset database (⚠️ akan hapus semua data!)
docker exec -it portal_backend npx prisma migrate reset
```

### Debugging

```bash
# Masuk ke backend container shell
docker exec -it portal_backend sh

# Masuk ke frontend container shell
docker exec -it portal_frontend sh

# Check container status
docker-compose ps

# View container stats (CPU, Memory)
docker stats portal_backend portal_frontend portal_db

# Inspect container
docker inspect portal_backend
```

### NPM Commands dalam Container

```bash
# Install package baru di backend
docker exec -it portal_backend npm install <package-name>

# Install package baru di frontend
docker exec -it portal_frontend npm install <package-name>

# Run tests
docker exec -it portal_backend npm test
```

## 🐛 Troubleshooting

### Port Already in Use

Jika port 3000, 8000, atau 5433 sudah digunakan, edit `docker-compose.yml`:

```yaml
ports:
  - "3001:3000" # Frontend port 3001 di host
  - "8001:8000" # Backend port 8001 di host
  - "5434:5432" # Database port 5434 di host
```

Jangan lupa update `NEXT_PUBLIC_API_URL` di frontend `.env.local` jika ganti port backend.

### Database Connection Error

```bash
# Check database health
docker-compose ps

# Restart database
docker-compose restart db

# View database logs
docker-compose logs db
```

### Frontend Can't Connect to Backend

Pastikan environment variable benar:

- Di `frontend/.env.local`: `NEXT_PUBLIC_API_URL="http://localhost:8000/api"`
- Backend harus running di port 8000

### Prisma Migration Failed

```bash
# Reset migrations (⚠️ akan hapus data!)
docker exec -it portal_backend npx prisma migrate reset

# Force deploy migrations
docker exec -it portal_backend npx prisma migrate deploy
```

### Container Won't Start

```bash
# Remove all containers and rebuild
docker-compose down
docker-compose up --build --force-recreate

# Clear Docker cache (nuclear option)
docker system prune -a
docker volume prune
```

### Hot Reload Not Working

1. Pastikan volume mounts benar di `docker-compose.yml`
2. Check file watchers limit (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

## 📊 Port Mapping

| Service       | Container Port | Host Port | Description        |
| ------------- | -------------- | --------- | ------------------ |
| Frontend      | 3000           | 3000      | Next.js Dev Server |
| Backend       | 8000           | 8000      | Express API        |
| PostgreSQL    | 5432           | 5433      | Database           |
| Prisma Studio | 5555           | 5555      | Database UI        |

## 🔒 Security Notes

⚠️ **IMPORTANT untuk Production:**

1. Ganti `JWT_SECRET` dengan random string yang kuat
2. Ganti `POSTGRES_PASSWORD`
3. Jangan commit file `.env` ke Git
4. Gunakan environment variables manager (AWS Secrets Manager, etc)
5. Enable SSL untuk database connection
6. Update `docker-compose.yml` untuk production configuration

## 📚 Next Steps

Setelah development environment berjalan:

1. ✅ Explore API documentation: `backend/API_DOCUMENTATION.md`
2. ✅ Explore architecture: `backend/ARCHITECTURE.md`
3. ✅ Check frontend README: `frontend/README.md`
4. ✅ Setup conversation guide caching (coming soon)

## 🆘 Need Help?

Jika menemui masalah:

1. Check logs: `docker-compose logs -f`
2. Verify environment variables di `.env` files
3. Ensure ports tidak konflik
4. Try rebuild: `docker-compose up --build --force-recreate`

---

**Happy Coding! 🚀**
