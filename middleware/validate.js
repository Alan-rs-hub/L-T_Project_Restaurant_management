const Joi = require('joi');
const mongoose = require('mongoose');

/**
 * Custom Joi ObjectId validator
 */
const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// ─── Auth Schemas ───────────────────────────────────────────────

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({ 'any.required': 'Name is required' }),
  email: Joi.string().trim().email().required()
    .messages({ 'any.required': 'Email is required', 'string.email': 'Invalid email format' }),
  password: Joi.string().min(6).max(128).required()
    .messages({ 'any.required': 'Password is required', 'string.min': 'Password must be at least 6 characters' }),
  role: Joi.string().valid('customer', 'admin', 'manager', 'kitchen').default('customer')
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});

// ─── Branch Schemas ─────────────────────────────────────────────

const branchSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150).required(),
  address: Joi.string().trim().min(5).required(),
  seatingCapacity: Joi.number().integer().min(1).required()
});

const branchUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  address: Joi.string().trim().min(5),
  seatingCapacity: Joi.number().integer().min(1),
  isActive: Joi.boolean()
}).min(1);

// ─── Table Schemas ──────────────────────────────────────────────

const tableSchema = Joi.object({
  branchId: Joi.string().custom(objectId).required(),
  tableNumber: Joi.number().integer().min(1).required(),
  capacity: Joi.number().integer().min(1).max(20).required()
});

const tableUpdateSchema = Joi.object({
  capacity: Joi.number().integer().min(1).max(20),
  isActive: Joi.boolean()
}).min(1);

// ─── Menu Item Schemas ──────────────────────────────────────────

const menuItemSchema = Joi.object({
  branchId: Joi.string().custom(objectId).required(),
  name: Joi.string().trim().min(2).max(150).required(),
  category: Joi.string().valid('appetizer', 'main_course', 'dessert', 'beverage', 'side', 'soup', 'salad', 'special').required(),
  price: Joi.number().positive().precision(2).required(),
  description: Joi.string().trim().max(500).allow('').default(''),
  isAvailable: Joi.boolean().default(true)
});

const menuItemUpdateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(150),
  category: Joi.string().valid('appetizer', 'main_course', 'dessert', 'beverage', 'side', 'soup', 'salad', 'special'),
  price: Joi.number().positive().precision(2),
  description: Joi.string().trim().max(500).allow(''),
  isAvailable: Joi.boolean()
}).min(1);

// ─── Reservation Schemas ────────────────────────────────────────

const reservationSchema = Joi.object({
  branchId: Joi.string().custom(objectId).required(),
  tableId: Joi.string().custom(objectId).required(),
  dateTime: Joi.date().iso().greater('now').required()
    .messages({ 'date.greater': 'Reservation must be in the future' }),
  duration: Joi.number().integer().min(30).max(300).default(120),
  partySize: Joi.number().integer().min(1).required(),
  specialRequests: Joi.string().trim().max(500).allow('').default('')
});

const reservationUpdateSchema = Joi.object({
  dateTime: Joi.date().iso().greater('now'),
  tableId: Joi.string().custom(objectId),
  duration: Joi.number().integer().min(30).max(300),
  partySize: Joi.number().integer().min(1),
  specialRequests: Joi.string().trim().max(500).allow('')
}).min(1);

// ─── Order Schemas ──────────────────────────────────────────────

const orderItemSchema = Joi.object({
  menuItemId: Joi.string().custom(objectId).required(),
  quantity: Joi.number().integer().min(1).required()
});

const orderSchema = Joi.object({
  branchId: Joi.string().custom(objectId).required(),
  items: Joi.array().items(orderItemSchema).min(1).required()
    .messages({ 'array.min': 'Order must contain at least one item' }),
  orderType: Joi.string().valid('dine_in', 'takeaway').default('dine_in'),
  tableId: Joi.string().custom(objectId).allow(null).default(null)
});

const orderStatusSchema = Joi.object({
  status: Joi.string().valid('placed', 'preparing', 'ready', 'served', 'delivered', 'cancelled').required()
});

// ─── Feedback Schemas ───────────────────────────────────────────

const feedbackSchema = Joi.object({
  orderId: Joi.string().custom(objectId).required(),
  rating: Joi.number().integer().min(1).max(5).required()
    .messages({ 'number.min': 'Rating must be between 1 and 5', 'number.max': 'Rating must be between 1 and 5' }),
  comment: Joi.string().trim().max(1000).allow('').default('')
});

// ─── Validation Middleware Factory ──────────────────────────────

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(d => d.message);
      return res.status(400).json({
        success: false,
        message: messages.join('; '),
        errorCode: 'VALIDATION_ERROR',
        details: messages
      });
    }

    req.body = value;
    next();
  };
};

// ─── Param ID Validator ─────────────────────────────────────────

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
        errorCode: 'VALIDATION_ERROR'
      });
    }
    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
  schemas: {
    register: registerSchema,
    login: loginSchema,
    branch: branchSchema,
    branchUpdate: branchUpdateSchema,
    table: tableSchema,
    tableUpdate: tableUpdateSchema,
    menuItem: menuItemSchema,
    menuItemUpdate: menuItemUpdateSchema,
    reservation: reservationSchema,
    reservationUpdate: reservationUpdateSchema,
    order: orderSchema,
    orderStatus: orderStatusSchema,
    feedback: feedbackSchema
  }
};
