const { pool } = require('../config/database');
const { generatePixCode } = require('../utils/helpers');
const logger = require('../utils/logger');
const QRCode = require('qrcode');

class PaymentService {
  /**
   * Create PIX payment
   */
  async createPixPayment(bookingId, amount, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verify booking belongs to user
      const bookingResult = await client.query(`
        SELECT id, status, total_price
        FROM public.bookings
        WHERE id = $1 AND user_id = $2
      `, [bookingId, userId]);
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found or access denied');
      }
      
      const booking = bookingResult.rows[0];
      
      if (booking.status !== 'pending') {
        throw new Error('Booking is not available for payment');
      }
      
      if (parseFloat(amount) !== parseFloat(booking.total_price)) {
        throw new Error('Payment amount does not match booking total');
      }
      
      // Generate PIX code and expiration
      const pixCode = generatePixCode();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30); // 30 minutes expiry
      
      // Create payment record
      const paymentResult = await client.query(`
        INSERT INTO public.payments (
          booking_id, amount, method, status, pix_code, pix_expires_at
        ) VALUES ($1, $2, 'pix', 'pending', $3, $4)
        RETURNING id, pix_code, pix_expires_at
      `, [bookingId, amount, pixCode, expiresAt]);
      
      const payment = paymentResult.rows[0];
      
      await client.query('COMMIT');
      
      // Generate QR Code for PIX
      const pixPayload = this.generatePixPayload(pixCode, amount);
      const qrCodeDataURL = await QRCode.toDataURL(pixPayload);
      
      logger.info('PIX payment created', { 
        paymentId: payment.id,
        bookingId,
        amount 
      });
      
      return {
        paymentId: payment.id,
        pixCode: payment.pix_code,
        qrCode: qrCodeDataURL,
        expiresAt: payment.pix_expires_at,
        amount,
        status: 'pending'
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Create PIX payment error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Process PIX webhook (simulated)
   */
  async processPixWebhook(pixCode, status, transactionId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Find payment by PIX code
      const paymentResult = await client.query(`
        SELECT p.id, p.booking_id, p.status as payment_status
        FROM public.payments p
        WHERE p.pix_code = $1
      `, [pixCode]);
      
      if (paymentResult.rows.length === 0) {
        throw new Error('Payment not found for PIX code');
      }
      
      const payment = paymentResult.rows[0];
      
      if (payment.payment_status !== 'pending') {
        throw new Error('Payment is not in pending status');
      }
      
      // Update payment status
      const newStatus = status === 'approved' ? 'completed' : 'failed';
      const paidAt = status === 'approved' ? new Date() : null;
      
      await client.query(`
        UPDATE public.payments 
        SET status = $1, transaction_id = $2, paid_at = $3
        WHERE id = $4
      `, [newStatus, transactionId, paidAt, payment.id]);
      
      // Update booking status if payment successful
      if (status === 'approved') {
        await client.query(`
          UPDATE public.bookings 
          SET status = 'confirmed'
          WHERE id = $1
        `, [payment.booking_id]);
      }
      
      await client.query('COMMIT');
      
      logger.info('PIX webhook processed', { 
        paymentId: payment.id,
        pixCode,
        status: newStatus 
      });
      
      return { success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Process PIX webhook error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get payment by booking ID
   */
  async getPaymentByBookingId(bookingId, userId) {
    try {
      const result = await pool.query(`
        SELECT 
          p.id,
          p.amount,
          p.method,
          p.status,
          p.pix_code,
          p.pix_expires_at,
          p.transaction_id,
          p.paid_at,
          p.created_at
        FROM public.payments p
        JOIN public.bookings b ON p.booking_id = b.id
        WHERE p.booking_id = $1 AND b.user_id = $2
        ORDER BY p.created_at DESC
        LIMIT 1
      `, [bookingId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Payment not found');
      }
      
      const payment = result.rows[0];
      
      // Generate QR code if PIX and still pending
      if (payment.method === 'pix' && payment.status === 'pending' && payment.pix_code) {
        const pixPayload = this.generatePixPayload(payment.pix_code, payment.amount);
        payment.qrCode = await QRCode.toDataURL(pixPayload);
      }
      
      return payment;
      
    } catch (error) {
      logger.error('Get payment error:', error);
      throw error;
    }
  }
  
  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId, userId) {
    try {
      const result = await pool.query(`
        SELECT 
          p.id,
          p.status,
          p.paid_at,
          p.pix_expires_at
        FROM public.payments p
        JOIN public.bookings b ON p.booking_id = b.id
        WHERE p.id = $1 AND b.user_id = $2
      `, [paymentId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Payment not found or access denied');
      }
      
      return result.rows[0];
      
    } catch (error) {
      logger.error('Check payment status error:', error);
      throw error;
    }
  }
  
  /**
   * Generate PIX payload for QR code
   */
  generatePixPayload(pixCode, amount) {
    // Simplified PIX payload structure
    // In production, this would follow the official PIX specification
    return JSON.stringify({
      version: "01",
      key: pixCode,
      amount: parseFloat(amount).toFixed(2),
      merchant: "AeroFly",
      description: "Pagamento de passagem aérea",
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Simulate PIX payment (for testing)
   */
  async simulatePixPayment(pixCode, approve = true) {
    try {
      const transactionId = `TXN_${Date.now()}`;
      const status = approve ? 'approved' : 'rejected';
      
      return await this.processPixWebhook(pixCode, status, transactionId);
      
    } catch (error) {
      logger.error('Simulate PIX payment error:', error);
      throw error;
    }
  }
  
  /**
   * Get payment methods
   */
  async getPaymentMethods() {
    return [
      {
        id: 'pix',
        name: 'PIX',
        description: 'Transferência instantânea via PIX',
        fee: 0,
        processingTime: 'Instantâneo'
      },
      {
        id: 'credit_card',
        name: 'Cartão de Crédito',
        description: 'Pagamento com cartão de crédito',
        fee: 2.5,
        processingTime: '1-2 dias úteis'
      },
      {
        id: 'debit_card',
        name: 'Cartão de Débito',
        description: 'Pagamento com cartão de débito',
        fee: 1.5,
        processingTime: 'Instantâneo'
      },
      {
        id: 'bank_transfer',
        name: 'Transferência Bancária',
        description: 'Transferência via TED/DOC',
        fee: 5.0,
        processingTime: '1-2 dias úteis'
      }
    ];
  }
}

module.exports = new PaymentService();