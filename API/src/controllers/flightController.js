const flightService = require('../services/flightService');
const logger = require('../utils/logger');

class FlightController {
  /**
   * Search flights
   */
  async searchFlights(req, res) {
    try {
      const result = await flightService.searchFlights(req.query);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      logger.error('Search flights controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Flight search failed',
        message: error.message
      });
    }
  }
  
  /**
   * Get flight by ID
   */
  async getFlightById(req, res) {
    try {
      const { id } = req.params;
      const flight = await flightService.getFlightById(id);
      
      res.json({
        success: true,
        data: { flight }
      });
      
    } catch (error) {
      logger.error('Get flight controller error:', error);
      
      if (error.message === 'Flight not found') {
        return res.status(404).json({
          success: false,
          error: 'Flight not found',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to get flight',
        message: error.message
      });
    }
  }
  
  /**
   * Get all airports
   */
  async getAirports(req, res) {
    try {
      const airports = await flightService.getAirports();
      
      res.json({
        success: true,
        data: { airports }
      });
      
    } catch (error) {
      logger.error('Get airports controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to get airports',
        message: error.message
      });
    }
  }
  
  /**
   * Get popular routes
   */
  async getPopularRoutes(req, res) {
    try {
      const { limit = 10 } = req.query;
      const routes = await flightService.getPopularRoutes(parseInt(limit));
      
      res.json({
        success: true,
        data: { routes }
      });
      
    } catch (error) {
      logger.error('Get popular routes controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to get popular routes',
        message: error.message
      });
    }
  }
  
  /**
   * Update flight status (Admin only)
   */
  async updateFlightStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await flightService.updateFlightStatus(id, status);
      
      res.json({
        success: true,
        message: 'Flight status updated successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Update flight status controller error:', error);
      
      if (error.message === 'Flight not found') {
        return res.status(404).json({
          success: false,
          error: 'Flight not found',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to update flight status',
        message: error.message
      });
    }
  }
  
  /**
   * Check seat availability
   */
  async checkSeatAvailability(req, res) {
    try {
      const { id } = req.params;
      const { seats = 1 } = req.query;
      
      const available = await flightService.checkSeatAvailability(id, parseInt(seats));
      
      res.json({
        success: true,
        data: { available, requestedSeats: parseInt(seats) }
      });
      
    } catch (error) {
      logger.error('Check seat availability controller error:', error);
      
      if (error.message === 'Flight not found') {
        return res.status(404).json({
          success: false,
          error: 'Flight not found',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to check seat availability',
        message: error.message
      });
    }
  }
}

module.exports = new FlightController();