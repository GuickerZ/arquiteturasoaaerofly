const { pool } = require('../config/database');
const { hashPassword } = require('../utils/helpers');
const logger = require('../utils/logger');

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          u.id,
          u.email,
          u.created_at,
          p.full_name,
          p.document,
          p.phone,
          p.birth_date,
          p.nationality
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE u.id = $1
      `, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
      
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { fullName, phone, birthDate, nationality } = profileData;
      
      // Update profile
      const result = await client.query(`
        UPDATE public.profiles 
        SET 
          full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          birth_date = COALESCE($3, birth_date),
          nationality = COALESCE($4, nationality),
          updated_at = NOW()
        WHERE user_id = $5
        RETURNING *
      `, [fullName, phone, birthDate, nationality, userId]);
      
      if (result.rows.length === 0) {
        // Create profile if it doesn't exist
        await client.query(`
          INSERT INTO public.profiles (user_id, full_name, phone, birth_date, nationality)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, fullName, phone, birthDate, nationality]);
      }
      
      await client.query('COMMIT');
      
      logger.info('User profile updated', { userId });
      
      // Return updated user data
      return await this.getUserById(userId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Update profile error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get current password hash
      const userResult = await pool.query(`
        SELECT encrypted_password
        FROM auth.users
        WHERE id = $1
      `, [userId]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = userResult.rows[0];
      
      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, user.encrypted_password);
      
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);
      
      // Update password
      await pool.query(`
        UPDATE auth.users 
        SET encrypted_password = $1, updated_at = NOW()
        WHERE id = $2
      `, [hashedNewPassword, userId]);
      
      logger.info('Password changed successfully', { userId });
      
      return { message: 'Password changed successfully' };
      
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
  
  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) as confirmed_bookings,
          COUNT(CASE WHEN b.status = 'completed' THEN 1 END) as completed_trips,
          COUNT(CASE WHEN b.status = 'cancelled' THEN 1 END) as cancelled_bookings,
          COALESCE(SUM(CASE WHEN b.status IN ('confirmed', 'completed') THEN b.total_price ELSE 0 END), 0) as total_spent,
          COUNT(DISTINCT f.destination_airport_id) as cities_visited
        FROM public.bookings b
        LEFT JOIN public.flights f ON b.flight_id = f.id
        WHERE b.user_id = $1
      `, [userId]);
      
      return result.rows[0];
      
    } catch (error) {
      logger.error('Get user statistics error:', error);
      throw error;
    }
  }
  
  /**
   * Delete user account
   */
  async deleteAccount(userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check for active bookings
      const activeBookingsResult = await client.query(`
        SELECT COUNT(*) as active_count
        FROM public.bookings
        WHERE user_id = $1 AND status IN ('pending', 'confirmed')
      `, [userId]);
      
      const activeCount = parseInt(activeBookingsResult.rows[0].active_count);
      
      if (activeCount > 0) {
        throw new Error('Cannot delete account with active bookings');
      }
      
      // Delete user data (cascade will handle related records)
      await client.query(`
        DELETE FROM auth.users
        WHERE id = $1
      `, [userId]);
      
      await client.query('COMMIT');
      
      logger.info('User account deleted', { userId });
      
      return { message: 'Account deleted successfully' };
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Delete account error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new UserService();