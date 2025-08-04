const { pool } = require('../config/database');
const { generateBookingReference, generateSeatNumber, paginate, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(userId, bookingData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { flightId, passengers } = bookingData;
      
      // Get flight details
      const flightResult = await client.query(`
        SELECT price, available_seats
        FROM public.flights
        WHERE id = $1
      `, [flightId]);
      
      if (flightResult.rows.length === 0) {
        throw new Error('Flight not found');
      }
      
      const flight = flightResult.rows[0];
      const passengersCount = passengers.length;
      
      // Check seat availability
      if (flight.available_seats < passengersCount) {
        throw new Error('Not enough seats available');
      }
      
      // Calculate total price
      const totalPrice = flight.price * passengersCount;
      
      // Generate booking reference
      const bookingReference = generateBookingReference();
      
      // Create booking
      const bookingResult = await client.query(`
        INSERT INTO public.bookings (
          user_id, flight_id, booking_reference, total_price, passengers_count
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, booking_reference, booking_date
      `, [userId, flightId, bookingReference, totalPrice, passengersCount]);
      
      const booking = bookingResult.rows[0];
      
      // Add passengers
      for (let i = 0; i < passengers.length; i++) {
        const passenger = passengers[i];
        const seatNumber = generateSeatNumber(
          Math.floor(Math.random() * 30) + 1, // Row 1-30
          Math.floor(Math.random() * 6) // Column A-F
        );
        
        await client.query(`
          INSERT INTO public.passengers (
            booking_id, full_name, document, birth_date, nationality, seat_number
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          booking.id,
          passenger.fullName,
          passenger.document,
          passenger.birthDate,
          passenger.nationality || 'Brasileira',
          seatNumber
        ]);
      }
      
      // Update available seats
      await client.query(`
        UPDATE public.flights 
        SET available_seats = available_seats - $1
        WHERE id = $2
      `, [passengersCount, flightId]);
      
      await client.query('COMMIT');
      
      logger.info('Booking created successfully', { 
        bookingId: booking.id, 
        userId, 
        flightId,
        passengersCount 
      });
      
      // Return complete booking data
      return await this.getBookingById(booking.id, userId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Create booking error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get booking by ID
   */
  async getBookingById(bookingId, userId = null) {
    try {
      let query = `
        SELECT 
          b.id,
          b.booking_reference,
          b.status,
          b.total_price,
          b.passengers_count,
          b.booking_date,
          f.id as flight_id,
          f.flight_number,
          f.departure_time,
          f.arrival_time,
          f.aircraft_type,
          a.name as airline_name,
          a.code as airline_code,
          orig.name as origin_airport,
          orig.code as origin_code,
          orig.city as origin_city,
          dest.name as destination_airport,
          dest.code as destination_code,
          dest.city as destination_city
        FROM public.bookings b
        JOIN public.flights f ON b.flight_id = f.id
        JOIN public.airlines a ON f.airline_id = a.id
        JOIN public.airports orig ON f.origin_airport_id = orig.id
        JOIN public.airports dest ON f.destination_airport_id = dest.id
        WHERE b.id = $1
      `;
      
      const params = [bookingId];
      
      if (userId) {
        query += ' AND b.user_id = $2';
        params.push(userId);
      }
      
      const bookingResult = await pool.query(query, params);
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingResult.rows[0];
      
      // Get passengers
      const passengersResult = await pool.query(`
        SELECT full_name, document, birth_date, nationality, seat_number
        FROM public.passengers
        WHERE booking_id = $1
        ORDER BY full_name
      `, [bookingId]);
      
      // Get payment information
      const paymentResult = await pool.query(`
        SELECT method, status, paid_at, pix_code
        FROM public.payments
        WHERE booking_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [bookingId]);
      
      return {
        ...booking,
        passengers: passengersResult.rows,
        payment: paymentResult.rows[0] || null
      };
      
    } catch (error) {
      logger.error('Get booking error:', error);
      throw error;
    }
  }
  
  /**
   * Get user bookings
   */
  async getUserBookings(userId, page = 1, limit = 10) {
    try {
      const { limit: queryLimit, offset } = paginate(page, limit);
      
      const bookingsResult = await pool.query(`
        SELECT 
          b.id,
          b.booking_reference,
          b.status,
          b.total_price,
          b.passengers_count,
          b.booking_date,
          f.flight_number,
          f.departure_time,
          f.arrival_time,
          a.name as airline_name,
          orig.code as origin_code,
          orig.city as origin_city,
          dest.code as destination_code,
          dest.city as destination_city
        FROM public.bookings b
        JOIN public.flights f ON b.flight_id = f.id
        JOIN public.airlines a ON f.airline_id = a.id
        JOIN public.airports orig ON f.origin_airport_id = orig.id
        JOIN public.airports dest ON f.destination_airport_id = dest.id
        WHERE b.user_id = $1
        ORDER BY b.booking_date DESC
        LIMIT $2 OFFSET $3
      `, [userId, queryLimit, offset]);
      
      const countResult = await pool.query(`
        SELECT COUNT(*) as total
        FROM public.bookings
        WHERE user_id = $1
      `, [userId]);
      
      const total = parseInt(countResult.rows[0].total);
      const meta = getPaginationMeta(total, page, limit);
      
      return {
        bookings: bookingsResult.rows,
        meta
      };
      
    } catch (error) {
      logger.error('Get user bookings error:', error);
      throw error;
    }
  }
  
  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, status, userId = null) {
    try {
      let query = `
        UPDATE public.bookings 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `;
      const params = [status, bookingId];
      
      if (userId) {
        query += ' AND user_id = $3';
        params.push(userId);
      }
      
      query += ' RETURNING id, booking_reference, status';
      
      const result = await pool.query(query, params);
      
      if (result.rows.length === 0) {
        throw new Error('Booking not found or access denied');
      }
      
      logger.info('Booking status updated', { bookingId, status });
      return result.rows[0];
      
    } catch (error) {
      logger.error('Update booking status error:', error);
      throw error;
    }
  }
  
  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get booking details
      const bookingResult = await client.query(`
        SELECT b.flight_id, b.passengers_count, b.status
        FROM public.bookings b
        WHERE b.id = $1 AND b.user_id = $2
      `, [bookingId, userId]);
      
      if (bookingResult.rows.length === 0) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingResult.rows[0];
      
      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }
      
      // Update booking status
      await client.query(`
        UPDATE public.bookings 
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = $1
      `, [bookingId]);
      
      // Return seats to flight
      await client.query(`
        UPDATE public.flights 
        SET available_seats = available_seats + $1
        WHERE id = $2
      `, [booking.passengers_count, booking.flight_id]);
      
      await client.query('COMMIT');
      
      logger.info('Booking cancelled successfully', { bookingId, userId });
      
      return { message: 'Booking cancelled successfully' };
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Cancel booking error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new BookingService();