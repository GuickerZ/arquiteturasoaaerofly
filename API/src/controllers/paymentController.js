const paymentService = require('../services/paymentService');
const logger = require('../utils/logger');

class PaymentController {
  /**
   * Create PIX payment
   */
  async createPixPayment(req, res) {
    try {
      const { bookingId, amount } = req.body;
      const userId = req.user.id;
      
      const payment = await paymentService.createPixPayment(bookingId, amount, userId);
      
      res.status(201).json({
        success: true,
        message: 'PIX payment created successfully',
        data: { payment }
      });
      
    } catch (error) {
      logger.error('Create PIX payment controller error:', error);
      
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found or access denied',
          message: error.message
        });
      }
      
      if (error.message.includes('not available for payment')) {
        return res.status(409).json({
          success: false,
          error: 'Booking not available for payment',
          message: error.message
        });
      }
      
      if (error.message.includes('amount does not match')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment amount',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Payment creation failed',
        message: error.message
      });
    }
  }
  
  /**
   * PIX webhook handler
   */
  async pixWebhook(req, res) {
    try {
      const { pixCode, status, transactionId } = req.body;
      
      // In production, verify webhook signature here
      const webhookSecret = req.headers['x-webhook-signature'];
      // ... verify signature logic ...
      
      const result = await paymentService.processPixWebhook(pixCode, status, transactionId);
      
      res.json({
        success: true,
        message: 'Webhook processed successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('PIX webhook controller error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Webhook processing failed',
        message: error.message
      });
    }
  }
  
  /**
   * Get payment by booking ID
   */
  async getPaymentByBookingId(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.id;
      
      const payment = await paymentService.getPaymentByBookingId(bookingId, userId);
      
      res.json({
        success: true,
        data: { payment }
      });
      
    } catch (error) {
      logger.error('Get payment controller error:', error);
      
      if (error.message === 'Payment not found') {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to get payment',
        message: error.message
      });
    }
  }
  
  /**
   * Check payment status
   */
  async checkPaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const payment = await paymentService.checkPaymentStatus(id, userId);
      
      res.json({
        success: true,
        data: { payment }
      });
      
    } catch (error) {
      logger.error('Check payment status controller error:', error);
      
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found or access denied',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to check payment status',
        message: error.message
      });
    }
  }
  
  /**
   * Simulate PIX payment (for testing)
   */
  async simulatePixPayment(req, res) {
    try {
      const { pixCode, approve = true } = req.body;
      
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Simulation not allowed in production'
        });
      }
      
      const result = await paymentService.simulatePixPayment(pixCode, approve);
      
      res.json({
        success: true,
        message: 'PIX payment simulated successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Simulate PIX payment controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Simulation failed',
        message: error.message
      });
    }
  }
  
  /**
   * Get payment methods
   */
  async getPaymentMethods(req, res) {
    try {
      const methods = await paymentService.getPaymentMethods();
      
      res.json({
        success: true,
        data: { methods }
      });
      
    } catch (error) {
      logger.error('Get payment methods controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to get payment methods',
        message: error.message
      });
    }
  }
}

module.exports = new PaymentController();