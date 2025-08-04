const express = require('express');
const bookingController = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const { validateBooking, validateUUID } = require('../middleware/validation');

const router = express.Router();

/**
 * @route POST /api/bookings
 * @desc Create a new booking
 * @access Private
 */
router.post('/', authenticateToken, validateBooking, bookingController.createBooking);

/**
 * @route GET /api/bookings
 * @desc Get user bookings
 * @access Private
 */
router.get('/', authenticateToken, bookingController.getUserBookings);

/**
 * @route GET /api/bookings/:id
 * @desc Get booking by ID
 * @access Private
 */
router.get('/:id', authenticateToken, validateUUID, bookingController.getBookingById);

/**
 * @route PUT /api/bookings/:id/status
 * @desc Update booking status
 * @access Private
 */
router.put('/:id/status', authenticateToken, validateUUID, bookingController.updateBookingStatus);

/**
 * @route DELETE /api/bookings/:id
 * @desc Cancel booking
 * @access Private
 */
router.delete('/:id', authenticateToken, validateUUID, bookingController.cancelBooking);

/**
 * @route GET /api/bookings/reference/:reference
 * @desc Get booking by reference (public lookup)
 * @access Public
 */
router.get('/reference/:reference', bookingController.getBookingByReference);

module.exports = router;