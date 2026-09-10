const Branch = require('../models/Branch');
const { paginate, paginationMeta } = require('../utils/pagination');

/**
 * GET /api/branches
 */
const getAllBranches = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;

    const [branches, total] = await Promise.all([
      Branch.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Branch.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Branches retrieved',
      data: { branches, pagination: paginationMeta(total, page, limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/branches/:id
 */
const getBranchById = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Branch retrieved', data: { branch } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/branches  (admin only)
 */
const createBranch = async (req, res, next) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json({ success: true, message: 'Branch created', data: { branch } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/branches/:id  (admin only)
 */
const updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Branch updated', data: { branch } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/branches/:id  (admin only)
 */
const deleteBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found', errorCode: 'NOT_FOUND' });
    }
    res.status(200).json({ success: true, message: 'Branch deleted', data: { branch } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch };
