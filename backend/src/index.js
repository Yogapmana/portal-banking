// backend/src/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "API berjalan!" });
});

app.listen(PORT, () => {
  console.log(`Backend server berjalan di http://localhost:${PORT}`);
});
