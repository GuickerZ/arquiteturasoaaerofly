const bookingService = require('../services/bookingService');
const logger = require('../utils/logger');

class BookingController {
  /**
   * Create new booking
   */
  async createBooking(req, res) {
    try {
      const userId = req.user.id;
      const booking = await bookingService.createBooking(userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: { booking }
      });
      
    } catch (error) {
      logger.error('Create booking controller error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found',
          message: error.message
        });
      }
      
      if (error.message.includes('Not enough seats')) {
        return res.status(409).json({
          success: false,
          error: 'Seats not available',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Booking creation failed',
        message: error.message
      });
    }
  }
  
  /**
   * Get booking by ID
   */
  async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const booking = await bookingService.getBookingById(id, userId);
      
      res.json({
        success: true,
        data: { booking }
      });
      
    } catch (error) {
      logger.error('Get booking controller error:', error);
      
      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to get booking',
        message: error.message
      });
    }
  }
  
  /**
   * Get user bookings
   */
  async getUserBookings(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      
      const result = await bookingService.getUserBookings(
        userId, 
        parseInt(page), 
        parseInt(limit)
      );
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      logger.error('Get user bookings controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to get bookings',
        message: error.message
      });
    }
  }
  
  /**
   * Update booking status
   */
  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
      
      const result = await bookingService.updateBookingStatus(id, status, userId);
      
      res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Update booking status controller error:', error);
      
      if (error.message.includes('not found') || error.message.includes('access denied')) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found or access denied',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to update booking status',
        message: error.message
      });
    }
  }
  
  /**
   * Cancel booking
   */
  async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const result = await bookingService.cancelBooking(id, userId);
      
      res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Cancel booking controller error:', error);
      
      if (error.message === 'Booking not found') {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
          message: error.message
        });
      }
      
      if (error.message.includes('already cancelled')) {
        return res.status(409).json({
          success: false,
          error: 'Booking already cancelled',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to cancel booking',
        message: error.message
      });
    }
  }
  
  /**
   * Get booking by reference
   */
  async getBookingByReference(req, res) {
    try {
      const { reference } = req.params;
      
      // This would be used for public booking lookup
      // Implementation would search by booking_reference
      // For now, returning not implemented
      
      res.status(501).json({
        success: false,
        error: 'Not implemented',
        message: 'Public booking lookup not yet implemented'
      });
      
    } catch (error) {
      logger.error('Get booking by reference controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to get booking',
        message: error.message
      });
    }
  }
}

module.exports = new BookingController();