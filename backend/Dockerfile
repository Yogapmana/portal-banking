FROM node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

# Jalankan generate DULU, baru jalankan server
CMD ["sh", "-c", "npx prisma generate && npm run dev"]