const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { validatePayment, validateUUID } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/payments/methods
 * @desc Get available payment methods
 * @access Public
 */
router.get('/methods', paymentController.getPaymentMethods);

/**
 * @route POST /api/payments/pix
 * @desc Create PIX payment
 * @access Private
 */
router.post('/pix', authenticateToken, validatePayment, paymentController.createPixPayment);

/**
 * @route POST /api/payments/pix/webhook
 * @desc PIX payment webhook
 * @access Public (webhook)
 */
router.post('/pix/webhook', paymentController.pixWebhook);

/**
 * @route POST /api/payments/pix/simulate
 * @desc Simulate PIX payment (development only)
 * @access Public (development)
 */
router.post('/pix/simulate', paymentController.simulatePixPayment);

/**
 * @route GET /api/payments/booking/:bookingId
 * @desc Get payment by booking ID
 * @access Private
 */
router.get('/booking/:bookingId', authenticateToken, validateUUID, paymentController.getPaymentByBookingId);

/**
 * @route GET /api/payments/:id/status
 * @desc Check payment status
 * @access Private
 */
router.get('/:id/status', authenticateToken, validateUUID, paymentController.checkPaymentStatus);

module.exports = router;