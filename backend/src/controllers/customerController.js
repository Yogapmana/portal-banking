const { asyncHandler } = require("../middleware/errorHandler");

/**
 * Customer Controller
 * Handles HTTP requests for customer management
 */
class CustomerController {
  constructor(customerService) {
    this.customerService = customerService;
  }

  /**
   * Get all customers with pagination and filters
   * @route GET /api/customers
   */
  getCustomers = asyncHandler(async (req, res) => {
    const result = await this.customerService.getCustomers(req.query, req.user);

    res.json(result);
  });

  /**
   * Get customer by ID
   * @route GET /api/customers/:id
   */
  getCustomerById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const customer = await this.customerService.getCustomerById(
      parseInt(id),
      req.user
    );

    res.json(customer);
  });

  /**
   * Get filter options
   * @route GET /api/customers/filters/options
   */
  getFilterOptions = asyncHandler(async (req, res) => {
    const options = await this.customerService.getFilterOptions();

    res.json(options);
  });

  /**
   * Assign customer to sales
   * @route POST /api/customers/:id/assign
   */
  assignCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { salesId } = req.body;

    const customer = await this.customerService.assignCustomerToSales(
      parseInt(id),
      parseInt(salesId),
      req.user
    );

    res.json({
      success: true,
      message: "Customer berhasil di-assign",
      data: customer,
    });
  });

  /**
   * Unassign customer from sales
   * @route POST /api/customers/:id/unassign
   */
  unassignCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const customer = await this.customerService.unassignCustomer(
      parseInt(id),
      req.user
    );

    res.json({
      success: true,
      message: "Customer berhasil di-unassign",
      data: customer,
    });
  });

  /**
   * Bulk assign customers to sales
   * @route POST /api/customers/bulk-assign
   */
  bulkAssignCustomers = asyncHandler(async (req, res) => {
    const { customerIds, salesId } = req.body;

    const result = await this.customerService.bulkAssignCustomers(
      customerIds,
      parseInt(salesId),
      req.user
    );

    res.json({
      success: true,
      message: `${result.count} customer berhasil di-assign`,
      data: result,
    });
  });

  /**
   * Bulk unassign customers from sales
   * @route POST /api/customers/bulk-unassign
   */
  bulkUnassignCustomers = asyncHandler(async (req, res) => {
    const { customerIds } = req.body;

    const result = await this.customerService.bulkUnassignCustomers(
      customerIds,
      req.user
    );

    res.json({
      success: true,
      message: `${result.count} customer berhasil di-unassign`,
      data: result,
    });
  });

  /**
   * Create new customer
   * @route POST /api/customers
   */
  createCustomer = asyncHandler(async (req, res) => {
    const customer = await this.customerService.createCustomer(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Customer berhasil dibuat",
      data: customer,
    });
  });

  /**
   * Update customer
   * @route PUT /api/customers/:id
   */
  updateCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const customer = await this.customerService.updateCustomer(
      parseInt(id),
      req.body,
      req.user
    );

    res.json({
      success: true,
      message: "Customer berhasil diupdate",
      data: customer,
    });
  });

  /**
   * Delete customer
   * @route DELETE /api/customers/:id
   */
  deleteCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await this.customerService.deleteCustomer(parseInt(id), req.user);

    res.json({
      success: true,
      message: "Customer berhasil dihapus",
    });
  });

  /**
   * Get customer count for a sales user
   * @route GET /api/customers/sales/:salesId/count
   */
  getCustomerCountBySales = asyncHandler(async (req, res) => {
    const { salesId } = req.params;

    const count = await this.customerService.getCustomerCountBySales(
      parseInt(salesId)
    );

    res.json({
      success: true,
      data: {
        salesId: parseInt(salesId),
        count,
      },
    });
  });
}

module.exports = CustomerController;
