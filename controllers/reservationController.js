const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const Branch = require('../models/Branch');
const { paginate, paginationMeta } = require('../utils/pagination');

/**
 * Check for overlapping reservations
 */
const hasOverlap = async (tableId, dateTime, duration, excludeId = null) => {
  const start = new Date(dateTime);
  const end = new Date(start.getTime() + duration * 60000);

  const query = {
    tableId,
    status: 'confirmed',
    $or: [
      // New reservation starts during existing one
      { dateTime: { $lt: end }, $expr: { $gt: [{ $add: ['$dateTime', { $multiply: ['$duration', 60000] }] }, start] } }
    ]
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  // Simpler overlap check: find confirmed reservations for this table
  // where the time ranges intersect
  const overlapping = await Reservation.find({
    tableId,
    status: 'confirmed',
    ...(excludeId ? { _id: { $ne: excludeId } } : {})
  });

  for (const res of overlapping) {
    const existStart = new Date(res.dateTime);
    const existEnd = new Date(existStart.getTime() + res.duration * 60000);
    // Overlap if: newStart < existEnd AND newEnd > existStart
    if (start < existEnd && end > existStart) {
      return true;
    }
  }

  return false;
};

/**
 * POST /api/reservations
 */
const createReservation = async (req, res, next) => {
  try {
    const { branchId, tableId, dateTime, duration, partySize, specialRequests } = req.body;

    // Verify branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found', errorCode: 'NOT_FOUND' });
    }

    // Verify table exists and belongs to the branch
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found', errorCode: 'NOT_FOUND' });
    }
    if (table.branchId.toString() !== branchId) {
      return res.status(409).json({
        success: false,
        message: 'Table does not belong to the selected branch',
        errorCode: 'BUSINESS_RULE_VIOLATION'
      });
    }

    // Verify table is active
    if (!table.isActive) {
      return res.status(409).json({
        success: false,
        message: 'This table is currently unavailable',
        errorCode: 'BUSINESS_RULE_VIOLATION'
      });
    }

    // Validate party size against table capacity
    if (partySize > table.capacity) {
      return res.status(409).json({
        success: false,
        message: `Party size (${partySize}) exceeds table capacity (${table.capacity})`,
        errorCode: 'BUSINESS_RULE_VIOLATION'
      });
    }

    // Check for overlapping reservations
    const overlap = await hasOverlap(tableId, dateTime, duration || 120);
    if (overlap) {
      return res.status(409).json({
        success: false,
        message: 'This table is already reserved for the selected time slot',
        errorCode: 'RESERVATION_CONFLICT'
      });
    }

    const reservation = new Reservation({
      customerId: req.user._id,
      branchId,
      tableId,
      dateTime,
      duration: duration || 120,
      partySize,
      specialRequests: specialRequests || ''
    });

    await reservation.save();
    await reservation.populate([
      { path: 'branchId', select: 'name address' },
      { path: 'tableId', select: 'tableNumber capacity' }
    ]);

    res.status(201).json({ success: true, message: 'Reservation created', data: { reservation } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reservations
 */
const getAllReservations = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};

    // Customers see only their own reservations
    if (req.user.role === 'customer') {
      filter.customerId = req.user._id;
    }

    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const day = new Date(req.query.date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.dateTime = { $gte: day, $lt: nextDay };
    }

    const [reservations, total] = await Promise.all([
      Reservation.find(filter)
        .populate('customerId', 'name email')
        .populate('branchId', 'name address')
        .populate('tableId', 'tableNumber capacity')
        .sort({ dateTime: -1 })
        .skip(skip).limit(limit),
      Reservation.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      message: 'Reservations retrieved',
      data: { reservations, pagination: paginationMeta(total, page, limit) }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reservations/:id
 */
const getReservationById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('branchId', 'name address')
      .populate('tableId', 'tableNumber capacity');

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found', errorCode: 'NOT_FOUND' });
    }

    // Customers can only see their own
    if (req.user.role === 'customer' && reservation.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'AUTH_FORBIDDEN' });
    }

    res.status(200).json({ success: true, message: 'Reservation retrieved', data: { reservation } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/reservations/:id  (reschedule)
 */
const updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found', errorCode: 'NOT_FOUND' });
    }

    // Ownership check for customers
    if (req.user.role === 'customer' && reservation.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'AUTH_FORBIDDEN' });
    }

    // Can only reschedule confirmed reservations
    if (reservation.status !== 'confirmed') {
      return res.status(409).json({
        success: false,
        message: `Cannot modify a ${reservation.status} reservation`,
        errorCode: 'BUSINESS_RULE_VIOLATION'
      });
    }

    const newTableId = req.body.tableId || reservation.tableId;
    const newDateTime = req.body.dateTime || reservation.dateTime;
    const newDuration = req.body.duration || reservation.duration;
    const newPartySize = req.body.partySize || reservation.partySize;

    // If table changed, verify it belongs to the branch
    if (req.body.tableId) {
      const table = await Table.findById(req.body.tableId);
      if (!table) {
        return res.status(404).json({ success: false, message: 'Table not found', errorCode: 'NOT_FOUND' });
      }
      if (table.branchId.toString() !== reservation.branchId.toString()) {
        return res.status(409).json({
          success: false,
          message: 'Table does not belong to the reservation branch',
          errorCode: 'BUSINESS_RULE_VIOLATION'
        });
      }
      if (newPartySize > table.capacity) {
        return res.status(409).json({
          success: false,
          message: `Party size exceeds table capacity (${table.capacity})`,
          errorCode: 'BUSINESS_RULE_VIOLATION'
        });
      }
    }

    // Check overlap for rescheduled time
    if (req.body.dateTime || req.body.tableId || req.body.duration) {
      const overlap = await hasOverlap(newTableId, newDateTime, newDuration, reservation._id);
      if (overlap) {
        return res.status(409).json({
          success: false,
          message: 'The new time slot conflicts with an existing reservation',
          errorCode: 'RESERVATION_CONFLICT'
        });
      }
    }

    // Apply updates
    if (req.body.dateTime) reservation.dateTime = req.body.dateTime;
    if (req.body.tableId) reservation.tableId = req.body.tableId;
    if (req.body.duration) reservation.duration = req.body.duration;
    if (req.body.partySize) reservation.partySize = req.body.partySize;
    if (req.body.specialRequests !== undefined) reservation.specialRequests = req.body.specialRequests;

    await reservation.save();
    await reservation.populate([
      { path: 'branchId', select: 'name address' },
      { path: 'tableId', select: 'tableNumber capacity' }
    ]);

    res.status(200).json({ success: true, message: 'Reservation updated', data: { reservation } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/reservations/:id  (cancel)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found', errorCode: 'NOT_FOUND' });
    }

    // Ownership check for customers
    if (req.user.role === 'customer' && reservation.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied', errorCode: 'AUTH_FORBIDDEN' });
    }

    // Can only cancel confirmed reservations
    if (reservation.status !== 'confirmed') {
      return res.status(409).json({
        success: false,
        message: `Cannot cancel a ${reservation.status} reservation`,
        errorCode: 'BUSINESS_RULE_VIOLATION'
      });
    }

    // Cancellation policy: cannot cancel less than 1 hour before
    const now = new Date();
    const reservationTime = new Date(reservation.dateTime);
    const hoursUntil = (reservationTime - now) / (1000 * 60 * 60);

    if (hoursUntil < 1 && req.user.role === 'customer') {
      return res.status(409).json({
        success: false,
        message: 'Reservations cannot be cancelled less than 1 hour before the scheduled time',
        errorCode: 'CANCELLATION_POLICY'
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({ success: true, message: 'Reservation cancelled', data: { reservation } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tables/available
 * Search available tables for a given branch, date/time, and party size
 */
const getAvailableTables = async (req, res, next) => {
  try {
    const { branchId, dateTime, duration, partySize } = req.query;

    if (!branchId || !dateTime) {
      return res.status(400).json({
        success: false,
        message: 'branchId and dateTime are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const dur = parseInt(duration) || 120;
    const size = parseInt(partySize) || 1;

    // Get all active tables for the branch with sufficient capacity
    const tables = await Table.find({
      branchId,
      isActive: true,
      capacity: { $gte: size }
    }).sort({ capacity: 1 });

    // Check each table for availability
    const availableTables = [];
    for (const table of tables) {
      const overlap = await hasOverlap(table._id, dateTime, dur);
      if (!overlap) {
        availableTables.push(table);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Available tables retrieved',
      data: { tables: availableTables, count: availableTables.length }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation, getAllReservations, getReservationById,
  updateReservation, cancelReservation, getAvailableTables
};
