const { body, param, query, validationResult } = require('express-validator');

// Helper: run validators and return 400 on failure
const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      await validation.run(req);
    }
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
};

// ─── Login ────────────────────────────────────────────────────────────────────

const validateLogin = validate([
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]);

// ─── ID Params ────────────────────────────────────────────────────────────────

const validateIdParam = validate([
  param('id')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer'),
]);

// ─── Report Filters ───────────────────────────────────────────────────────────

const validateReportFilters = validate([
  query('from_date')
    .optional()
    .isISO8601().withMessage('from_date must be a valid ISO date'),
  query('to_date')
    .optional()
    .isISO8601().withMessage('to_date must be a valid ISO date'),
  query('department')
    .optional()
    .isIn(['Hospital', 'Police', 'Both']).withMessage('department must be Hospital, Police, or Both'),
]);

// ─── Incident Filters ────────────────────────────────────────────────────────

const validateIncidentFilters = validate([
  query('status')
    .optional()
    .isIn(['active', 'resolved']).withMessage('status must be active or resolved'),
  query('from_date')
    .optional()
    .isISO8601().withMessage('from_date must be a valid ISO date'),
  query('to_date')
    .optional()
    .isISO8601().withMessage('to_date must be a valid ISO date'),
]);

module.exports = {
  validateLogin,
  validateIdParam,
  validateReportFilters,
  validateIncidentFilters,
};
