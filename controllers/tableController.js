const Table = require('../models/Table');
const Branch = require('../models/Branch');
const { paginate, paginationMeta } = require('../utils/pagination');

/**
 * GET /api/tables
 */
const getAllTables = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.active === 'true') filter.isActive = true;
    if (req.query.minCapacity) filter.capacity = { $gte: parseInt(req.query.minCapacity) };

    const [tables, total] = await Promise.all([
      Table.find(filter).populate('branchId', 'name address').sort({ branchId: 1, tableNumber: 1 }).skip(skip).limit(limit),
      Table.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Tables retrieved',
      data: { tables, pagination: paginationMeta(total, page, limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tables/:id
 */
const getTableById = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id).populate('branchId', 'name address');
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Table retrieved', data: { table } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tables  (admin only)
 */
const createTable = async (req, res, next) => {
  try {
    // Verify branch exists
    const branch = await Branch.findById(req.body.branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found', errorCode: 'NOT_FOUND' });
    }

    const table = new Table(req.body);
    await table.save();

    res.status(201).json({ success: true, message: 'Table created', data: { table } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tables/:id  (admin only)
 */
const updateTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Table updated', data: { table } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tables/:id  (admin only)
 */
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Table deleted', data: { table } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTables, getTableById, createTable, updateTable, deleteTable };
