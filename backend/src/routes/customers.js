const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authMiddleware, requireAdminOrManager } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers with pagination, search, and filter
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
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
    const searchConditions = [];
    if (search) {
      searchConditions.push(
        { name: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { job: { contains: search, mode: "insensitive" } }
      );
    }

    // Role-based filtering
    if (req.user.role === "SALES") {
      // Sales bisa lihat semua customer (untuk sementara, sampai ada assignment system)
      // TODO: Implement proper assignment system
      const salesConditions = [
        { salesId: null }, // Customer yang belum diassign
        { salesId: req.user.userId } // Customer yang diassign ke sales ini
      ];

      if (searchConditions.length > 0) {
        // Combine search and sales conditions
        where.AND = [
          {
            OR: salesConditions
          },
          {
            OR: searchConditions
          }
        ];
      } else {
        // Only sales conditions (no search)
        where.OR = salesConditions;
      }
    } else {
      // Admin dan Sales Manager bisa lihat semua customer
      if (searchConditions.length > 0) {
        where.OR = searchConditions;
      }
    }

    // Score range filter
    if (minScore !== undefined || maxScore !== undefined) {
      const scoreCondition = {};
      if (minScore !== undefined) scoreCondition.gte = parseFloat(minScore);
      if (maxScore !== undefined) scoreCondition.lte = parseFloat(maxScore);

      if (where.AND) {
        where.AND.push({ score: scoreCondition });
      } else {
        where.score = scoreCondition;
      }
    }

    // Exact match filters
    const exactFilters = {};
    if (job) exactFilters.job = job;
    if (marital) exactFilters.marital = marital;
    if (education) exactFilters.education = education;
    if (housing) exactFilters.housing = housing;

    // Add exact filters to where clause
    if (Object.keys(exactFilters).length > 0) {
      if (where.AND) {
        where.AND.push(exactFilters);
      } else {
        Object.assign(where, exactFilters);
      }
    }

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
  })
);

// Get customer by ID
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer tidak ditemukan" });
    }

    // Role-based access check
    // Untuk sementara, sales bisa lihat semua customer
    // TODO: Implement proper assignment system
    // if (req.user.role === "SALES" && customer.salesId !== req.user.userId && customer.salesId !== null) {
    //   return res.status(403).json({ message: "Access denied" });
    // }

    res.json(customer);
  })
);

// Get filter options (distinct values for dropdowns)
router.get("/filters/options", authMiddleware, asyncHandler(async (req, res) => {
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
  })
);

module.exports = router;
