const express = require('express');
const flightController = require('../controllers/flightController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateFlightSearch, validateUUID } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/flights/search
 * @desc Search flights
 * @access Public
 */
router.get('/search', validateFlightSearch, flightController.searchFlights);

/**
 * @route GET /api/flights/airports
 * @desc Get all airports
 * @access Public
 */
router.get('/airports', flightController.getAirports);

/**
 * @route GET /api/flights/popular-routes
 * @desc Get popular routes
 * @access Public
 */
router.get('/popular-routes', flightController.getPopularRoutes);

/**
 * @route GET /api/flights/:id
 * @desc Get flight by ID
 * @access Public
 */
router.get('/:id', validateUUID, optionalAuth, flightController.getFlightById);

/**
 * @route GET /api/flights/:id/availability
 * @desc Check seat availability
 * @access Public
 */
router.get('/:id/availability', validateUUID, flightController.checkSeatAvailability);

/**
 * @route PUT /api/flights/:id/status
 * @desc Update flight status (Admin only)
 * @access Private (Admin)
 */
router.put('/:id/status', 
  validateUUID, 
  authenticateToken, 
  requireAdmin, 
  flightController.updateFlightStatus
);

module.exports = router;