const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client"); // Sesuaikan path

const prisma = new PrismaClient();

function readCSV(filePath, separator = ",") {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: separator }))
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

/**
 * LANGKAH 1: Isi tabel Customer dengan data mentah
 */
async function seedCustomers(customerRows) {
  console.log(`Memulai seeding ${customerRows.length} data customer mentah...`);
  let successCount = 0;
  let rowIndex = 0;

  for (const row of customerRows) {
    try {
      // Parse numeric values dengan validasi
      const age = row.age ? parseInt(row.age.replace(/"/g, "").trim()) : 0;
      const duration = row.duration
        ? parseInt(row.duration.replace(/"/g, "").trim())
        : 0;
      const campaign = row.campaign
        ? parseInt(row.campaign.replace(/"/g, "").trim())
        : 0;
      const pdays = row.pdays
        ? parseInt(row.pdays.replace(/"/g, "").trim())
        : 0;
      const previous = row.previous
        ? parseInt(row.previous.replace(/"/g, "").trim())
        : 0;
      const empVarRate = row["emp.var.rate"]
        ? parseFloat(row["emp.var.rate"].replace(/"/g, "").trim())
        : 0;
      const consPriceIdx = row["cons.price.idx"]
        ? parseFloat(row["cons.price.idx"].replace(/"/g, "").trim())
        : 0;
      const consConfIdx = row["cons.conf.idx"]
        ? parseFloat(row["cons.conf.idx"].replace(/"/g, "").trim())
        : 0;
      const euribor3m = row.euribor3m
        ? parseFloat(row.euribor3m.replace(/"/g, "").trim())
        : 0;
      const nrEmployed = row["nr.employed"]
        ? parseFloat(row["nr.employed"].replace(/"/g, "").trim())
        : 0;

      await prisma.customer.create({
        data: {
          originalId: rowIndex,
          age: age,
          job: row.job ? row.job.replace(/"/g, "").trim() : "",
          marital: row.marital ? row.marital.replace(/"/g, "").trim() : "",
          education: row.education
            ? row.education.replace(/"/g, "").trim()
            : "",
          default: row.default ? row.default.replace(/"/g, "").trim() : "",
          housing: row.housing ? row.housing.replace(/"/g, "").trim() : "",
          loan: row.loan ? row.loan.replace(/"/g, "").trim() : "",
          contact: row.contact ? row.contact.replace(/"/g, "").trim() : "",
          month: row.month ? row.month.replace(/"/g, "").trim() : "",
          dayOfWeek: row.day_of_week
            ? row.day_of_week.replace(/"/g, "").trim()
            : "",
          duration: duration,
          campaign: campaign,
          pdays: pdays,
          previous: previous,
          poutcome: row.poutcome ? row.poutcome.replace(/"/g, "").trim() : "",
          empVarRate: empVarRate,
          consPriceIdx: consPriceIdx,
          consConfIdx: consConfIdx,
          euribor3m: euribor3m,
          nrEmployed: nrEmployed,
        },
      });
      successCount++;
      rowIndex++;

      // Progress indicator setiap 1000 records
      if (rowIndex % 1000 === 0) {
        console.log(`Telah memproses ${rowIndex} records...`);
      }
    } catch (err) {
      console.error(`Gagal memproses baris customer: ${rowIndex}`, err.message);
      console.error(`Data:`, JSON.stringify(row, null, 2));
      rowIndex++;
    }
  }
  console.log(
    `Selesai memuat ${successCount} dari ${customerRows.length} data customer.`
  );
}

/**
 * LANGKAH 2: Update customer dengan data skor
 */
async function seedScores(scoreRows) {
  console.log(`Memulai update ${scoreRows.length} data skor...`);
  let successCount = 0;
  let notFoundCount = 0;

  for (const row of scoreRows) {
    try {
      const originalId = parseInt(row.customer_id);

      if (isNaN(originalId)) {
        console.warn(`Melewatkan customer_id tidak valid: ${row.customer_id}`);
        continue;
      }

      const score = row.skor_probabilitas
        ? parseFloat(row.skor_probabilitas)
        : null;
      const name = row.nama ? row.nama.replace(/"/g, "").trim() : null;
      const phoneNumber = row.no_telp
        ? row.no_telp.replace(/"/g, "").trim()
        : null;

      // Cari customer berdasarkan originalId
      const updateData = {
        score: score,
        name: name,
        phoneNumber: phoneNumber,
      };

      // Hanya update fields yang tidak null
      Object.keys(updateData).forEach(
        (key) => updateData[key] === null && delete updateData[key]
      );

      await prisma.customer.update({
        where: { originalId: originalId },
        data: updateData,
      });
      successCount++;

      // Progress indicator setiap 100 records
      if ((successCount + notFoundCount) % 100 === 0) {
        console.log(
          `Telah memproses ${successCount + notFoundCount} skor records...`
        );
      }
    } catch (err) {
      if (err.code === "P2025") {
        // Record not found error
        notFoundCount++;
      } else {
        console.error(
          `Gagal meng-update customer dengan customer_id ${row.customer_id}:`,
          err.message
        );
      }
    }
  }
  console.log(
    `Selesai meng-update ${successCount} data skor. ${notFoundCount} customer tidak ditemukan.`
  );
}

async function main() {
  console.log("Mulai seeding...");

  try {
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully.");

    // HAPUS SEMUA DATA LAMA
    console.log("Menghapus data lama...");
    await prisma.customer.deleteMany({}); // Hanya hapus customer (skor sudah bagian dari customer)
    await prisma.user.deleteMany({}); // Hapus user juga

    // Buat user admin default (gunakan environment variables)
    const bcrypt = require("bcryptjs");

    // Get credentials from environment or use secure defaults
    const adminEmail = process.env.ADMIN_EMAIL || "admin@bank.com";
    const adminPasswordPlain = process.env.ADMIN_PASSWORD || "Admin123!";
    const salesEmail = process.env.SALES_EMAIL || "sales@bank.com";
    const salesPasswordPlain = process.env.SALES_PASSWORD || "Sales123!";

    const adminPassword = await bcrypt.hash(adminPasswordPlain, 12);
    const salesPassword = await bcrypt.hash(salesPasswordPlain, 12);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin user created successfully");

    // Buat user sales dummy (opsional, untuk login)
    await prisma.user.create({
      data: {
        email: salesEmail,
        password: salesPassword,
        role: "SALES",
      },
    });
    console.log("Sales user created successfully");

    // 1. Baca data mentah
    console.log("Membaca data bank-additional-full.csv...");
    const customerRows = await readCSV(
      path.join(__dirname, "data/bank-additional-full.csv"),
      ";" // Pemisah titik koma
    );
    console.log(`Berhasil membaca ${customerRows.length} baris data customer.`);

    // 2. Baca data skor
    console.log("Membaca data nasabah_prioritas_untuk_portal.csv...");
    const scoreRows = await readCSV(
      path.join(__dirname, "data/nasabah_prioritas_untuk_portal.csv"),
      "," // Pemisah koma
    );
    console.log(`Berhasil membaca ${scoreRows.length} baris data skor.`);

    // 3. Jalankan seed customer DULU
    await seedCustomers(customerRows);

    // 4. SETELAH itu, jalankan update skor
    await seedScores(scoreRows);

    console.log("✅ Seeding selesai dengan sukses!");
  } catch (error) {
    console.error("❌ Error saat seeding:", error.message);

    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("Authentication failed")
    ) {
      console.error(
        "\n💡 Tips: Pastikan database server berjalan dan kredensial database benar."
      );
      console.error(
        "   Untuk development lokal, Anda bisa menggunakan SQLite dengan mengubah .env:"
      );
      console.error('   DATABASE_URL="file:./dev.db"');
      console.error("   Lalu jalankan: npx prisma migrate dev --name init");
    }

    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
