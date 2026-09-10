const express = require('express');
const router = express.Router();
const { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validate');

router.get('/', getAllMenuItems);
router.get('/:id', validateObjectId(), getMenuItemById);
router.post('/', authenticate, authorize('admin', 'manager'), validate(schemas.menuItem), createMenuItem);
router.put('/:id', authenticate, authorize('admin', 'manager'), validateObjectId(), validate(schemas.menuItemUpdate), updateMenuItem);
router.delete('/:id', authenticate, authorize('admin', 'manager'), validateObjectId(), deleteMenuItem);

module.exports = router;
