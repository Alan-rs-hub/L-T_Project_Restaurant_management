const express = require('express');
const router = express.Router();
const { getAllTables, getTableById, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { getAvailableTables } = require('../controllers/reservationController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validate');

router.get('/available', authenticate, getAvailableTables);
router.get('/', getAllTables);
router.get('/:id', validateObjectId(), getTableById);
router.post('/', authenticate, authorize('admin'), validate(schemas.table), createTable);
router.put('/:id', authenticate, authorize('admin'), validateObjectId(), validate(schemas.tableUpdate), updateTable);
router.delete('/:id', authenticate, authorize('admin'), validateObjectId(), deleteTable);

module.exports = router;
