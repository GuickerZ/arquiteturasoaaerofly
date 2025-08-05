const { supabase } = require('../config/supabase');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    try {
      const { email, password, fullName, document, phone, birthDate } = userData;
      
      // Use Supabase Auth to create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (authError) {
        throw new Error(authError.message);
      }
      
      const user = authData.user;
      
      // Insert profile using Supabase client
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: fullName,
          document,
          phone,
          birth_date: birthDate
        });
      
      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }
      
      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });
      
      logger.info('User registered successfully', { userId: user.id, email });
      
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName,
          createdAt: user.created_at
        },
        token
      };
      
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }
  
  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Use Supabase Auth to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        throw new Error('Invalid email or password');
      }
      
      const user = authData.user;
      
      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        logger.error('Profile fetch error:', profileError);
      }
      
      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });
      
      logger.info('User logged in successfully', { userId: user.id, email });
      
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: profileData?.full_name,
          document: profileData?.document,
          phone: profileData?.phone,
          birthDate: profileData?.birth_date
        },
        token
      };
      
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }
  
  /**
   * Refresh token
   */
  async refreshToken(userId) {
    try {
      // Get user from Supabase Auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !userData.user) {
        throw new Error('User not found');
      }
      
      const user = userData.user;
      const token = generateToken({ userId: user.id, email: user.email });
      
      return { token };
      
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }
  
  /**
   * Reset password request
   */
  async requestPasswordReset(email) {
    try {
      // Use Supabase Auth to request password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        logger.error('Password reset error:', error);
      }
      
      logger.info('Password reset requested', { email });
      
      return { message: 'If an account with that email exists, a reset link has been sent.' };
      
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();