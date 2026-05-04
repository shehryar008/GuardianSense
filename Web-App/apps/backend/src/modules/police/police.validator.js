const { body, param, validationResult } = require('express-validator');

const validateCreateStation = [
  body('station_name')
    .trim()
    .notEmpty().withMessage('station_name is required')
    .isString().withMessage('station_name must be a string'),
  body('address')
    .trim()
    .notEmpty().withMessage('address is required')
    .isString().withMessage('address must be a string'),
  body('city')
    .trim()
    .notEmpty().withMessage('city is required')
    .isString().withMessage('city must be a string'),
  body('phone')
    .trim()
    .notEmpty().withMessage('phone is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('phone must be a valid phone number format'),
  body('email')
    .trim()
    .notEmpty().withMessage('email is required')
    .isEmail().withMessage('email must be a valid email address'),
  body('password')
    .optional()
    .isString().withMessage('password must be a string')
    .isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
];

const validateUpdateStation = [
  body('station_name').optional().trim().notEmpty().isString(),
  body('address').optional().trim().notEmpty().isString(),
  body('city').optional().trim().notEmpty().isString(),
  body('phone').optional().trim().notEmpty().matches(/^\+?[1-9]\d{1,14}$/),
  body('email').optional().trim().notEmpty().isEmail(),
];

const validateDispatch = [
  body('incident_id')
    .notEmpty().withMessage('incident_id is required')
    .isInt({ min: 1 }).withMessage('incident_id must be a positive integer'),
  body('station_id')
    .notEmpty().withMessage('station_id is required')
    .isInt({ min: 1 }).withMessage('station_id must be a positive integer'),
];

const validateStatusUpdate = [
  body('dispatch_status')
    .notEmpty().withMessage('dispatch_status is required')
    .isIn(['En Route', 'Resolved']).withMessage('dispatch_status must be either "En Route" or "Resolved"'),
];

const validateStationIdParam = [
  param('station_id')
    .isInt({ min: 1 }).withMessage('station_id must be a positive integer'),
];

const validateStationId = [
  param('id')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),
];

const validateIncidentIdParam = [
  param('incident_id')
    .isInt({ min: 1 }).withMessage('incident_id must be a positive integer'),
];

const validateDispatchIdParam = [
  param('dispatch_id')
    .isInt({ min: 1 }).withMessage('dispatch_id must be a positive integer'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: errors.array().map((e) => e.msg).join(', '),
    });
  }
  next();
};

module.exports = {
  validateCreateStation,
  validateUpdateStation,
  validateDispatch,
  validateStatusUpdate,
  validateStationIdParam,
  validateStationId,
  validateIncidentIdParam,
  validateDispatchIdParam,
  handleValidationErrors,
};
