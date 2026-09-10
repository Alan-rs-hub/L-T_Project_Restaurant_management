const Order = require('../models/Order');
const Reservation = require('../models/Reservation');

/**
 * GET /api/manager/reports/sales
 * Revenue by branch
 */
const getSalesReport = async (req, res, next) => {
  try {
    const matchStage = {
      status: { $in: ['served', 'delivered'] }
    };

    // Optional date range filter
    if (req.query.startDate || req.query.endDate) {
      matchStage.createdAt = {};
      if (req.query.startDate) matchStage.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) matchStage.createdAt.$lte = new Date(req.query.endDate);
    }

    const salesByBranch = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$branchId',
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'branches',
          localField: '_id',
          foreignField: '_id',
          as: 'branch'
        }
      },
      { $unwind: '$branch' },
      {
        $project: {
          branchName: '$branch.name',
          branchAddress: '$branch.address',
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalOrders: 1,
          avgOrderValue: { $round: ['$avgOrderValue', 2] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Overall summary
    const overallSummary = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Sales report generated',
      data: {
        salesByBranch,
        overall: overallSummary[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/manager/reports/popular-dishes
 * Most frequently ordered menu items
 */
const getPopularDishes = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const matchStage = {
      status: { $nin: ['cancelled'] }
    };

    if (req.query.branchId) {
      const mongoose = require('mongoose');
      matchStage.branchId = new mongoose.Types.ObjectId(req.query.branchId);
    }

    const popularDishes = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItemId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.itemTotal' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $project: {
          menuItemId: '$_id',
          name: 1,
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Popular dishes report generated',
      data: { popularDishes }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/manager/reports/peak-hours
 * Group orders/reservations by hour
 */
const getPeakHours = async (req, res, next) => {
  try {
    const orderPeakHours = await Order.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: '$_id',
          orderCount: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      }
    ]);

    const reservationPeakHours = await Reservation.aggregate([
      { $match: { status: { $nin: ['cancelled'] } } },
      {
        $group: {
          _id: { $hour: '$dateTime' },
          reservationCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: '$_id',
          reservationCount: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Peak hours report generated',
      data: { orderPeakHours, reservationPeakHours }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/manager/reports/overview
 * General statistics
 */
const getOverview = async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      totalReservations,
      activeReservations,
      totalRevenue
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['placed', 'preparing', 'ready'] } }),
      Order.countDocuments({ status: { $in: ['served', 'delivered'] } }),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: 'confirmed' }),
      Order.aggregate([
        { $match: { status: { $in: ['served', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      message: 'Overview report generated',
      data: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalReservations,
        activeReservations,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesReport, getPopularDishes, getPeakHours, getOverview };
