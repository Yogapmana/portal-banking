const ConversationGuideService = require("../services/conversationGuideService");
const CustomerRepository = require("../repositories/customerRepository");
const { PrismaClient } = require("@prisma/client");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  AuthorizationError,
  NotFoundError,
} = require("../middleware/errorHandler");

class ConversationGuideController {
  constructor() {
    this.prisma = new PrismaClient();
    this.conversationGuideService = new ConversationGuideService();
    this.customerRepository = new CustomerRepository(this.prisma);
  }

  /**
   * Get conversation guide for a customer
   * @route GET /api/conversation-guide/:customerId
   */
  getConversationGuide = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { customerId } = req.params;

    // Get customer data
    const customer = await this.customerRepository.findById(
      parseInt(customerId)
    );

    if (!customer) {
      throw new NotFoundError("Customer tidak ditemukan");
    }

    // Authorization check
    // SALES can only see conversation guide for assigned customers
    if (userRole === "SALES" && customer.salesId !== userId) {
      throw new AuthorizationError("Anda tidak memiliki akses ke customer ini");
    }

    // Generate conversation guide
    const guide = await this.conversationGuideService.generateConversationGuide(
      customer
    );

    res.json({
      success: true,
      data: {
        customerId: customer.id,
        customerName: customer.name,
        guide,
      },
    });
  });
}

module.exports = ConversationGuideController;
