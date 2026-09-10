const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.post('/', authenticate, authorize('customer'), validate(schemas.feedback), createFeedback);
router.get('/', authenticate, getAllFeedback);

module.exports = router;
