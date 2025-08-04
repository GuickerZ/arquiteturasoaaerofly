const userService = require('../services/userService');
const logger = require('../utils/logger');

class UserController {
  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found'
        });
      }
      
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
  
  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.updateProfile(userId, req.body);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      });
      
    } catch (error) {
      logger.error('Update profile controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }
  
  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      const result = await userService.changePassword(userId, currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Password changed successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Change password controller error:', error);
      
      if (error.message.includes('incorrect')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid current password',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to change password',
        message: error.message
      });
    }
  }
  
  /**
   * Get user statistics
   */
  async getUserStatistics(req, res) {
    try {
      const userId = req.user.id;
      const statistics = await userService.getUserStatistics(userId);
      
      res.json({
        success: true,
        data: { statistics }
      });
      
    } catch (error) {
      logger.error('Get user statistics controller error:', error);
      
      res.status(400).json({
        success: false,
        error: 'Failed to get statistics',
        message: error.message
      });
    }
  }
  
  /**
   * Delete user account
   */
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;
      
      // Verify password before deletion
      const bcrypt = require('bcryptjs');
      const { pool } = require('../config/database');
      
      const userResult = await pool.query(`
        SELECT encrypted_password
        FROM auth.users
        WHERE id = $1
      `, [userId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User not found'
        });
      }
      
      const isValidPassword = await bcrypt.compare(password, userResult.rows[0].encrypted_password);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Invalid password',
          message: 'Password is incorrect'
        });
      }
      
      const result = await userService.deleteAccount(userId);
      
      res.json({
        success: true,
        message: 'Account deleted successfully',
        data: result
      });
      
    } catch (error) {
      logger.error('Delete account controller error:', error);
      
      if (error.message.includes('active bookings')) {
        return res.status(409).json({
          success: false,
          error: 'Cannot delete account',
          message: error.message
        });
      }
      
      res.status(400).json({
        success: false,
        error: 'Failed to delete account',
        message: error.message
      });
    }
  }
}

module.exports = new UserController();