const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers with pagination, search, and filter
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      minScore,
      maxScore,
      job,
      marital,
      education,
      housing,
      sortBy = "score",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause for filtering
    const where = {};

    // Search by name, phone number, or job
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { job: { contains: search, mode: "insensitive" } },
      ];
    }

    // Score range filter
    if (minScore !== undefined || maxScore !== undefined) {
      where.score = {};
      if (minScore !== undefined) where.score.gte = parseFloat(minScore);
      if (maxScore !== undefined) where.score.lte = parseFloat(maxScore);
    }

    // Exact match filters
    if (job) where.job = job;
    if (marital) where.marital = marital;
    if (education) where.education = education;
    if (housing) where.housing = housing;

    // Build order clause
    let orderBy;
    if (sortBy === "score" && sortOrder === "desc") {
      orderBy = [{ score: "desc" }, { originalId: "asc" }];
    } else if (sortBy === "score" && sortOrder === "asc") {
      orderBy = [{ score: "asc" }, { originalId: "asc" }];
    } else if (sortBy === "age") {
      orderBy = { age: sortOrder };
    } else {
      // Default: sort by score desc, then by originalId
      orderBy = [{ score: "desc" }, { originalId: "asc" }];
    }

    // Get customers and total count
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          id: true,
          originalId: true,
          name: true,
          phoneNumber: true,
          score: true,
          age: true,
          job: true,
          marital: true,
          education: true,
          housing: true,
          loan: true,
          contact: true,
          month: true,
          duration: true,
          campaign: true,
          pdays: true,
          previous: true,
          poutcome: true,
        },
      }),
      prisma.customer.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / take);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.json({
      customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCustomers: total,
        limit: take,
        hasNext,
        hasPrev,
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    res.json(customer);
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get filter options (distinct values for dropdowns)
router.get("/filters/options", async (req, res) => {
  try {
    const [jobs, maritalStatuses, educationLevels, housingTypes] =
      await Promise.all([
        prisma.customer.findMany({
          select: { job: true },
          distinct: ["job"],
          orderBy: { job: "asc" },
        }),
        prisma.customer.findMany({
          select: { marital: true },
          distinct: ["marital"],
          orderBy: { marital: "asc" },
        }),
        prisma.customer.findMany({
          select: { education: true },
          distinct: ["education"],
          orderBy: { education: "asc" },
        }),
        prisma.customer.findMany({
          select: { housing: true },
          distinct: ["housing"],
          orderBy: { housing: "asc" },
        }),
      ]);

    const scoreStats = await prisma.customer.aggregate({
      where: { score: { not: null } },
      _min: { score: true },
      _max: { score: true },
      _avg: { score: true },
    });

    res.json({
      jobOptions: jobs.map((j) => j.job).filter(Boolean),
      maritalOptions: maritalStatuses.map((m) => m.marital).filter(Boolean),
      educationOptions: educationLevels.map((e) => e.education).filter(Boolean),
      housingOptions: housingTypes.map((h) => h.housing).filter(Boolean),
      scoreRange: {
        min: scoreStats._min.score,
        max: scoreStats._max.score,
        avg: scoreStats._avg.score,
      },
    });
  } catch (error) {
    console.error("Get filter options error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
