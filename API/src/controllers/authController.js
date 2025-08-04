const authService = require('../services/authService');
const logger = require('../utils/logger');

class AuthController {
  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Registration controller error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Registration failed',
        message: error.message
      });
    }
  }
  
  /**
   * Login user
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
      
    } catch (error) {
      logger.error('Login controller error:', error);
      
      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'Invalid email or password'
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Login failed',
        message: error.message
      });
    }
  }
  
  /**
   * Refresh token
   */
  async refreshToken(req, res) {
    try {
      const userId = req.user.id;
      const result = await authService.refreshToken(userId);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Refresh token controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Token refresh failed',
        message: error.message
      });
    }
  }
  
  /**
   * Request password reset
   */
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      
      res.json({
        success: true,
        data: result
      });
      
    } catch (error) {
      logger.error('Password reset request controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Password reset request failed',
        message: error.message
      });
    }
  }
  
  /**
   * Logout user
   */
  async logout(req, res) {
    try {
      // In a real implementation, you might blacklist the token
      // For now, we'll just return success
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
      
    } catch (error) {
      logger.error('Logout controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Logout failed',
        message: error.message
      });
    }
  }
  
  /**
   * Get current user profile
   */
  async getProfile(req, res) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        data: { user }
      });
      
    } catch (error) {
      logger.error('Get profile controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to get profile',
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();