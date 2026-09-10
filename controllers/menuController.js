const MenuItem = require('../models/MenuItem');
const Branch = require('../models/Branch');
const { paginate, paginationMeta } = require('../utils/pagination');

/**
 * GET /api/menu
 */
const getAllMenuItems = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.available === 'true') filter.isAvailable = true;
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      MenuItem.find(filter).populate('branchId', 'name').sort({ category: 1, name: 1 }).skip(skip).limit(limit),
      MenuItem.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Menu items retrieved',
      data: { menuItems: items, pagination: paginationMeta(total, page, limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/menu/:id
 */
const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('branchId', 'name');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Menu item retrieved', data: { menuItem: item } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/menu  (admin/manager)
 */
const createMenuItem = async (req, res, next) => {
  try {
    // Verify branch exists
    const branch = await Branch.findById(req.body.branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found', errorCode: 'NOT_FOUND' });
    }

    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json({ success: true, message: 'Menu item created', data: { menuItem: item } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/menu/:id  (admin/manager)
 */
const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Menu item updated', data: { menuItem: item } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/menu/:id  (admin/manager)
 */
const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Menu item deleted', data: { menuItem: item } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem };
