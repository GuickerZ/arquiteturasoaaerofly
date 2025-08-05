const { body, param, query, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('document')
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('Document must be exactly 11 characters'),
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Please provide a valid Brazilian phone number'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Flight validation rules
const validateFlightSearch = [
  query('origin')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Origin airport code must be 3 characters'),
  query('destination')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Destination airport code must be 3 characters'),
  query('departureDate')
    .isISO8601()
    .withMessage('Please provide a valid departure date'),
  query('passengers')
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage('Passengers must be between 1 and 9'),
  handleValidationErrors
];

// Booking validation rules
const validateBooking = [
  body('flightId')
    .isUUID()
    .withMessage('Please provide a valid flight ID'),
  body('passengers')
    .isArray({ min: 1 })
    .withMessage('At least one passenger is required'),
  body('passengers.*.fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Passenger full name must be at least 2 characters'),
  body('passengers.*.document')
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('Passenger document must be exactly 11 characters'),
  body('passengers.*.birthDate')
    .isISO8601()
    .withMessage('Please provide a valid birth date'),
  body('passengers.*.nationality')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nationality must be at least 2 characters'),
  handleValidationErrors
];

// Payment validation rules
const validatePayment = [
  body('bookingId')
    .isUUID()
    .withMessage('Please provide a valid booking ID'),
  body('method')
    .isIn(['pix', 'credit_card', 'debit_card', 'bank_transfer'])
    .withMessage('Please provide a valid payment method'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  handleValidationErrors
];

// Parameter validation
const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Please provide a valid ID'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateFlightSearch,
  validateBooking,
  validatePayment,
  validateUUID,
  handleValidationErrors,
  body
};