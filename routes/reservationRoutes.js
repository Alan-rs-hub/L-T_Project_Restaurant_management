const express = require('express');
const router = express.Router();
const { createReservation, getAllReservations, getReservationById, updateReservation, cancelReservation } = require('../controllers/reservationController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, validateObjectId, schemas } = require('../middleware/validate');

router.post('/', authenticate, authorize('customer'), validate(schemas.reservation), createReservation);
router.get('/', authenticate, getAllReservations);
router.get('/:id', authenticate, validateObjectId(), getReservationById);
router.put('/:id', authenticate, validateObjectId(), validate(schemas.reservationUpdate), updateReservation);
router.delete('/:id', authenticate, validateObjectId(), cancelReservation);

module.exports = router;
