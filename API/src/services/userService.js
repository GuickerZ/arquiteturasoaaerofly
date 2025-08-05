const { supabase } = require('../config/supabase');
const { hashPassword } = require('../utils/helpers');
const logger = require('../utils/logger');

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      // Get user from Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !userData.user) {
        return null;
      }
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        logger.error('Profile fetch error:', profileError);
      }
      
      return {
        id: userData.user.id,
        email: userData.user.email,
        created_at: userData.user.created_at,
        full_name: profileData?.full_name,
        document: profileData?.document,
        phone: profileData?.phone,
        birth_date: profileData?.birth_date,
        nationality: profileData?.nationality
      };
      
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  async updateProfile(userId, profileData) {
    try {
      const { fullName, phone, birthDate, nationality } = profileData;
      
      const updateData = {};
      if (fullName !== undefined) updateData.full_name = fullName;
      if (phone !== undefined) updateData.phone = phone;
      if (birthDate !== undefined) updateData.birth_date = birthDate;
      if (nationality !== undefined) updateData.nationality = nationality;
      
      // Update profile using Supabase
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          ...updateData
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }
      
      logger.info('User profile updated', { userId });
      
      // Return updated user data
      return await this.getUserById(userId);
      
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }
  
  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Get user from Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !userData.user) {
        throw new Error('User not found');
      }
      
      // Use Supabase Auth to update password
      const { error: passwordError } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword
      });
      
      if (passwordError) {
        throw new Error(`Password update failed: ${passwordError.message}`);
      }
      
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
      // Get user bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          status,
          total_price,
          flights!inner(destination_airport_id)
        `)
        .eq('user_id', userId);
      
      if (bookingsError) {
        throw new Error(`Failed to get user statistics: ${bookingsError.message}`);
      }
      
      const statistics = {
        confirmed_bookings: bookings.filter(b => b.status === 'confirmed').length,
        completed_trips: bookings.filter(b => b.status === 'completed').length,
        cancelled_bookings: bookings.filter(b => b.status === 'cancelled').length,
        total_spent: bookings
          .filter(b => ['confirmed', 'completed'].includes(b.status))
          .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0),
        cities_visited: new Set(
          bookings
            .filter(b => ['confirmed', 'completed'].includes(b.status))
            .map(b => b.flights.destination_airport_id)
        ).size
      };
      
      return statistics;
      
    } catch (error) {
      logger.error('Get user statistics error:', error);
      throw error;
    }
  }
  
  /**
   * Delete user account
   */
  async deleteAccount(userId) {
    try {
      // Check for active bookings
      const { data: activeBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['pending', 'confirmed']);
      
      if (bookingsError) {
        throw new Error(`Failed to check active bookings: ${bookingsError.message}`);
      }
      
      if (activeBookings && activeBookings.length > 0) {
        throw new Error('Cannot delete account with active bookings');
      }
      
      // Delete user using Supabase Auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        throw new Error(`Failed to delete user: ${deleteError.message}`);
      }
      
      logger.info('User account deleted', { userId });
      
      return { message: 'Account deleted successfully' };
      
    } catch (error) {
      logger.error('Delete account error:', error);
      throw error;
    }
  }
}

module.exports = new UserService();