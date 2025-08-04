const { pool } = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../utils/helpers');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { email, password, fullName, document, phone, birthDate } = userData;
      
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM auth.users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        throw new Error('User already exists with this email');
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Insert user into auth.users (simulating Supabase auth)
      const userResult = await client.query(`
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, NOW(), NOW(), NOW())
        RETURNING id, email, created_at
      `, [email, hashedPassword]);
      
      const user = userResult.rows[0];
      
      // Insert profile
      await client.query(`
        INSERT INTO public.profiles (user_id, full_name, document, phone, birth_date)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.id, fullName, document, phone, birthDate]);
      
      await client.query('COMMIT');
      
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
      await client.query('ROLLBACK');
      logger.error('Registration error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Login user
   */
  async login(email, password) {
    try {
      // Get user with profile data
      const result = await pool.query(`
        SELECT 
          u.id, 
          u.email, 
          u.encrypted_password,
          p.full_name,
          p.document,
          p.phone,
          p.birth_date
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE u.email = $1
      `, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }
      
      const user = result.rows[0];
      
      // Compare password
      const isValidPassword = await comparePassword(password, user.encrypted_password);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }
      
      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });
      
      logger.info('User logged in successfully', { userId: user.id, email });
      
      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          document: user.document,
          phone: user.phone,
          birthDate: user.birth_date
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
      const result = await pool.query(`
        SELECT 
          u.id, 
          u.email,
          p.full_name
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE u.id = $1
      `, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      const user = result.rows[0];
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
      const result = await pool.query(
        'SELECT id FROM auth.users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        // Don't reveal that user doesn't exist
        return { message: 'If an account with that email exists, a reset link has been sent.' };
      }
      
      // Here you would typically send an email with reset token
      // For now, just log it
      const resetToken = generateToken({ userId: result.rows[0].id, type: 'password_reset' }, '1h');
      
      logger.info('Password reset requested', { email, resetToken });
      
      return { message: 'If an account with that email exists, a reset link has been sent.' };
      
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();