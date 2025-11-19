const express = require("express");
const ConversationGuideController = require("../controllers/conversationGuideController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
const conversationGuideController = new ConversationGuideController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route GET /api/conversation-guide/:customerId
 * @desc Get AI-generated conversation guide for a customer
 * @access SALES, SALES_MANAGER
 */
router.get("/:customerId", conversationGuideController.getConversationGuide);

module.exports = router;
