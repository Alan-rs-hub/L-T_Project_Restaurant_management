const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, getCustomerOrders, getKitchenOrders } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validate');

router.post('/', authenticate, authorize('customer'), validate(schemas.order), createOrder);
router.get('/', authenticate, getAllOrders);
router.get('/:id', authenticate, validateObjectId(), getOrderById);
router.put('/:id/status', authenticate, authorize('admin', 'manager', 'kitchen'), validateObjectId(), validate(schemas.orderStatus), updateOrderStatus);

module.exports = router;
