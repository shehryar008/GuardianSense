const { body, param } = require('express-validator');

const validateCreateHospital = [
  body('hospital_name')
    .trim()
    .notEmpty().withMessage('hospital_name is required')
    .isString().withMessage('hospital_name must be a string')
    .isLength({ max: 150 }).withMessage('hospital_name must be at most 150 characters'),
  body('address')
    .trim()
    .notEmpty().withMessage('address is required')
    .isString().withMessage('address must be a string'),
  body('city')
    .trim()
    .notEmpty().withMessage('city is required')
    .isString().withMessage('city must be a string')
    .isLength({ max: 100 }).withMessage('city must be at most 100 characters'),
  body('phone')
    .trim()
    .notEmpty().withMessage('phone is required')
    .isString().withMessage('phone must be a string')
    .isLength({ max: 20 }).withMessage('phone must be at most 20 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('email is required')
    .isEmail().withMessage('email must be a valid email address'),
  body('bed_capacity')
    .notEmpty().withMessage('bed_capacity is required')
    .isInt({ min: 1 }).withMessage('bed_capacity must be an integer >= 1'),
];

const validateUpdateHospital = [
  param('id')
    .isInt({ min: 1 }).withMessage('Hospital ID must be a positive integer'),
  ...validateCreateHospital,
];

const validateCreateDispatch = [
  body('incident_id')
    .notEmpty().withMessage('incident_id is required')
    .isInt({ min: 1 }).withMessage('incident_id must be a positive integer'),
  body('hospital_id')
    .notEmpty().withMessage('hospital_id is required')
    .isInt({ min: 1 }).withMessage('hospital_id must be a positive integer'),
];

const validateUpdateDispatchStatus = [
  param('dispatch_id')
    .isInt({ min: 1 }).withMessage('dispatch_id must be a positive integer'),
  body('dispatch_status')
    .notEmpty().withMessage('dispatch_status is required')
    .isIn(['Pending', 'En Route', 'Resolved']).withMessage("dispatch_status must be one of: 'Pending', 'En Route', 'Resolved'"),
];

const validateHospitalId = [
  param('id')
    .isInt({ min: 1 }).withMessage('Hospital ID must be a positive integer'),
];

const validateIncidentId = [
  param('incident_id')
    .isInt({ min: 1 }).withMessage('Incident ID must be a positive integer'),
];

const validateHospitalIdParam = [
  param('hospital_id')
    .isInt({ min: 1 }).withMessage('Hospital ID must be a positive integer'),
];

module.exports = {
  validateCreateHospital,
  validateUpdateHospital,
  validateCreateDispatch,
  validateUpdateDispatchStatus,
  validateHospitalId,
  validateIncidentId,
  validateHospitalIdParam,
};
