const express = require('express');
const router = express.Router();
const { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch } = require('../controllers/branchController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validate');

router.get('/', getAllBranches);
router.get('/:id', validateObjectId(), getBranchById);
router.post('/', authenticate, authorize('admin'), validate(schemas.branch), createBranch);
router.put('/:id', authenticate, authorize('admin'), validateObjectId(), validate(schemas.branchUpdate), updateBranch);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId(), deleteBranch);

module.exports = router;
