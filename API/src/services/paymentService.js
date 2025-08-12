const EfiPay = require('sdk-node-apis-efi');
const logger = require('../utils/logger');

const efipayOptions = {
  sandbox: false, // Defina como true para homologação
  client_id: 'seuClientId',
  client_secret: 'seuClientSecret',
  certificate: 'caminho/Ate/O/Certificado/Pix',
  cert_base64: false,
};

const efipay = new EfiPay(efipayOptions);

class PaymentService {
  /**
   * Create PIX payment using EfiPay
   */
  async createPixPayment(bookingId, amount, userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar se a reserva pertence ao usuário
      const bookingResult = await client.query(
        `
        SELECT id, status, total_price
        FROM public.bookings
        WHERE id = $1 AND user_id = $2
      `,
        [bookingId, userId]
      );

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

      // Criar cobrança PIX usando EfiPay
      const chargeInput = {
        items: [
          {
            name: `Booking #${bookingId}`,
            value: Math.round(amount * 100), // Valor em centavos
            amount: 1,
          },
        ],
      };

      const chargeResponse = await efipay.createCharge({}, chargeInput);

      if (!chargeResponse || !chargeResponse.data || !chargeResponse.data.charge_id) {
        throw new Error('Failed to create PIX charge');
      }

      const chargeId = chargeResponse.data.charge_id;

      // Gerar QR Code para o pagamento PIX
      const pixResponse = await efipay.pixGenerateQRCode({ id: chargeId });

      if (!pixResponse || !pixResponse.data || !pixResponse.data.qrcode) {
        throw new Error('Failed to generate PIX QR Code');
      }

      const pixCode = pixResponse.data.qrcode;
      const qrCodeImage = pixResponse.data.qrcode_image;

      // Criar registro de pagamento no banco de dados
      const paymentResult = await client.query(
        `
        INSERT INTO public.payments (
          booking_id, amount, method, status, pix_code, pix_expires_at
        ) VALUES ($1, $2, 'pix', 'pending', $3, NOW() + INTERVAL '30 minutes')
        RETURNING id, pix_code, pix_expires_at
      `,
        [bookingId, amount, pixCode]
      );

      const payment = paymentResult.rows[0];

      await client.query('COMMIT');

      logger.info('PIX payment created', {
        paymentId: payment.id,
        bookingId,
        amount,
      });

      return {
        paymentId: payment.id,
        pixCode: payment.pix_code,
        qrCode: qrCodeImage,
        expiresAt: payment.pix_expires_at,
        amount,
        status: 'pending',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Create PIX payment error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new PaymentService();
