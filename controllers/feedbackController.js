const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const { paginate, paginationMeta } = require('../utils/pagination');

/**
 * POST /api/feedback
 */
const createFeedback = async (req, res, next) => {
  try {
    const { orderId, rating, comment } = req.body;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found', errorCode: 'NOT_FOUND' });
    }

    // Verify the customer owns this order
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own orders',
        errorCode: 'AUTH_FORBIDDEN'
      });
    }

    // Only allow feedback for completed orders (served/delivered)
    if (!['served', 'delivered'].includes(order.status)) {
      return res.status(409).json({
        success: false,
        message: 'Feedback can only be submitted for completed orders (served or delivered)',
        errorCode: 'BUSINESS_RULE_VIOLATION'
      });
    }

    // Check if feedback already exists for this order
    const existingFeedback = await Feedback.findOne({ orderId });
    if (existingFeedback) {
      return res.status(409).json({
        success: false,
        message: 'Feedback has already been submitted for this order',
        errorCode: 'DUPLICATE_ERROR'
      });
    }

    const feedback = new Feedback({
      orderId,
      customerId: req.user._id,
      rating,
      comment: comment || ''
    });

    await feedback.save();
    await feedback.populate([
      { path: 'orderId', select: 'orderNumber status totalAmount' },
      { path: 'customerId', select: 'name email' }
    ]);

    res.status(201).json({ success: true, message: 'Feedback submitted', data: { feedback } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/feedback
 */
const getAllFeedback = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};

    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    }

    if (req.query.orderId) filter.orderId = req.query.orderId;
    if (req.query.rating) filter.rating = parseInt(req.query.rating);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate('orderId', 'orderNumber status totalAmount')
        .populate('customerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip).limit(limit),
      Feedback.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Feedback retrieved',
      data: { feedbacks, pagination: paginationMeta(total, page, limit) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createFeedback, getAllFeedback };
