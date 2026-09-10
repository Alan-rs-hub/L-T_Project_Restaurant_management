const express = require('express');
const router = express.Router();
const { getSalesReport, getPopularDishes, getPeakHours, getOverview } = require('../controllers/reportController');
const { getKitchenOrders, getCustomerOrders } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

// Kitchen routes
router.get('/kitchen/orders', authenticate, authorize('admin', 'manager', 'kitchen'), getKitchenOrders);

// Customer order history
router.get('/customers/:id/orders', authenticate, validateObjectId(), getCustomerOrders);

// Manager report routes
router.get('/manager/reports/overview', authenticate, authorize('admin', 'manager'), getOverview);
router.get('/manager/reports/sales', authenticate, authorize('admin', 'manager'), getSalesReport);
router.get('/manager/reports/popular-dishes', authenticate, authorize('admin', 'manager'), getPopularDishes);
router.get('/manager/reports/peak-hours', authenticate, authorize('admin', 'manager'), getPeakHours);

module.exports = router;
