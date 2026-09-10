const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Branch = require('../models/Branch');
const { calculateBilling } = require('../utils/calculations');
const { paginate, paginationMeta } = require('../utils/pagination');

// Valid status transitions
const VALID_TRANSITIONS = {
  placed: ['preparing', 'cancelled'],
  preparing: ['ready'],
  ready: ['served', 'delivered'],
  served: [],
  delivered: [],
  cancelled: []
};

/**
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { branchId, items, orderType, tableId } = req.body;

    // Verify branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found', errorCode: 'NOT_FOUND' });
    }

    // Validate each item: exists, available, belongs to branch
    const processedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItemId} not found`,
          errorCode: 'NOT_FOUND'
        });
      }
      if (!menuItem.isAvailable) {
        return res.status(409).json({
          success: false,
          message: `"${menuItem.name}" is currently unavailable`,
          errorCode: 'BUSINESS_RULE_VIOLATION'
        });
      }
      if (menuItem.branchId.toString() !== branchId) {
        return res.status(409).json({
          success: false,
          message: `"${menuItem.name}" is not available at this branch`,
          errorCode: 'BUSINESS_RULE_VIOLATION'
        });
      }

      processedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    // Calculate billing server-side
    const taxRate = parseFloat(process.env.TAX_RATE) || 0.05;
    const serviceChargeRate = parseFloat(process.env.SERVICE_CHARGE_RATE) || 0.10;
    const { processedItems: billedItems, billing } = calculateBilling(processedItems, taxRate, serviceChargeRate);

    const order = new Order({
      customerId: req.user._id,
      branchId,
      items: billedItems,
      orderType: orderType || 'dine_in',
      tableId: tableId || null,
      billing,
      totalAmount: billing.grandTotal
    });

    await order.save();
    await order.populate([
      { path: 'branchId', select: 'name' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: 'Order placed successfully', data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};

    // Customers see only their own orders
    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    }

    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.orderType) filter.orderType = req.query.orderType;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('customerId', 'name email')
        .populate('branchId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Orders retrieved',
      data: { orders, pagination: paginationMeta(total, page, limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('branchId', 'name address');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', errorCode: 'NOT_FOUND' });
    }

    // Customers can only see their own
    if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'AUTH_FORBIDDEN' });
    }

    res.status(200).json({ success: true, message: 'Order retrieved', data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/orders/:id/status
 * Strictly controlled status transitions
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status: newStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', errorCode: 'NOT_FOUND' });
    }

    const currentStatus = order.status;
    const allowedTransitions = VALID_TRANSITIONS[currentStatus];

    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      return res.status(409).json({
        success: false,
        message: `Invalid status transition: ${currentStatus} → ${newStatus}. Allowed: ${(allowedTransitions || []).join(', ') || 'none'}`,
        errorCode: 'INVALID_STATUS_TRANSITION'
      });
    }

    order.status = newStatus;
    await order.save();

    await order.populate([
      { path: 'customerId', select: 'name email' },
      { path: 'branchId', select: 'name' }
    ]);

    res.status(200).json({ success: true, message: `Order status updated to ${newStatus}`, data: { order } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/customers/:id/orders
 */
const getCustomerOrders = async (req, res, next) => {
  try {
    const customerId = req.params.id;

    // Customers can only see their own history
    if (req.user.role === 'customer' && req.user._id.toString() !== customerId) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'AUTH_FORBIDDEN' });
    }

    const { page, limit, skip } = paginate(req.query);

    const [orders, total] = await Promise.all([
      Order.find({ customerId })
        .populate('branchId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Order.countDocuments({ customerId })
    ]);

    res.status(200).json({
      success: true,
      message: 'Customer orders retrieved',
      data: { orders, pagination: paginationMeta(total, page, limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/kitchen/orders
 */
const getKitchenOrders = async (req, res, next) => {
  try {
    const filter = {
      status: { $in: ['placed', 'preparing', 'ready'] }
    };
    if (req.query.branchId) filter.branchId = req.query.branchId;

    const orders = await Order.find(filter)
      .populate('customerId', 'name')
      .populate('branchId', 'name')
      .sort({ status: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      message: 'Kitchen orders retrieved',
      data: { orders, count: orders.length }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder, getAllOrders, getOrderById,
  updateOrderStatus, getCustomerOrders, getKitchenOrders
};
