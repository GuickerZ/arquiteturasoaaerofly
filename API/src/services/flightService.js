const { pool } = require('../config/database');
const { paginate, getPaginationMeta } = require('../utils/helpers');
const logger = require('../utils/logger');

class FlightService {
  /**
   * Search flights
   */
  async searchFlights(searchParams) {
    try {
      const { 
        origin, 
        destination, 
        departureDate, 
        returnDate, 
        passengers = 1, 
        page = 1, 
        limit = 10 
      } = searchParams;
      
      const { limit: queryLimit, offset } = paginate(page, limit);
      
      let query = `
        SELECT 
          f.id,
          f.flight_number,
          f.departure_time,
          f.arrival_time,
          f.price,
          f.available_seats,
          f.total_seats,
          f.status,
          f.aircraft_type,
          a.name as airline_name,
          a.code as airline_code,
          a.logo_url as airline_logo,
          orig.name as origin_airport,
          orig.code as origin_code,
          orig.city as origin_city,
          dest.name as destination_airport,
          dest.code as destination_code,
          dest.city as destination_city
        FROM public.flights f
        JOIN public.airlines a ON f.airline_id = a.id
        JOIN public.airports orig ON f.origin_airport_id = orig.id
        JOIN public.airports dest ON f.destination_airport_id = dest.id
        WHERE 
          orig.code = $1 
          AND dest.code = $2 
          AND DATE(f.departure_time) = $3
          AND f.available_seats >= $4
          AND f.status = 'scheduled'
        ORDER BY f.departure_time ASC
        LIMIT $5 OFFSET $6
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total
        FROM public.flights f
        JOIN public.airports orig ON f.origin_airport_id = orig.id
        JOIN public.airports dest ON f.destination_airport_id = dest.id
        WHERE 
          orig.code = $1 
          AND dest.code = $2 
          AND DATE(f.departure_time) = $3
          AND f.available_seats >= $4
          AND f.status = 'scheduled'
      `;
      
      const params = [origin, destination, departureDate, passengers, queryLimit, offset];
      const countParams = [origin, destination, departureDate, passengers];
      
      const [flightsResult, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, countParams)
      ]);
      
      const flights = flightsResult.rows.map(flight => ({
        ...flight,
        duration: this.calculateDuration(flight.departure_time, flight.arrival_time)
      }));
      
      const total = parseInt(countResult.rows[0].total);
      const meta = getPaginationMeta(total, page, limit);
      
      return { flights, meta };
      
    } catch (error) {
      logger.error('Flight search error:', error);
      throw error;
    }
  }
  
  /**
   * Get flight by ID
   */
  async getFlightById(flightId) {
    try {
      const result = await pool.query(`
        SELECT 
          f.id,
          f.flight_number,
          f.departure_time,
          f.arrival_time,
          f.price,
          f.available_seats,
          f.total_seats,
          f.status,
          f.aircraft_type,
          a.name as airline_name,
          a.code as airline_code,
          a.logo_url as airline_logo,
          orig.name as origin_airport,
          orig.code as origin_code,
          orig.city as origin_city,
          dest.name as destination_airport,
          dest.code as destination_code,
          dest.city as destination_city
        FROM public.flights f
        JOIN public.airlines a ON f.airline_id = a.id
        JOIN public.airports orig ON f.origin_airport_id = orig.id
        JOIN public.airports dest ON f.destination_airport_id = dest.id
        WHERE f.id = $1
      `, [flightId]);
      
      if (result.rows.length === 0) {
        throw new Error('Flight not found');
      }
      
      const flight = result.rows[0];
      return {
        ...flight,
        duration: this.calculateDuration(flight.departure_time, flight.arrival_time)
      };
      
    } catch (error) {
      logger.error('Get flight error:', error);
      throw error;
    }
  }
  
  /**
   * Get all airports
   */
  async getAirports() {
    try {
      const result = await pool.query(`
        SELECT id, name, code, city, country
        FROM public.airports
        ORDER BY city ASC
      `);
      
      return result.rows;
      
    } catch (error) {
      logger.error('Get airports error:', error);
      throw error;
    }
  }
  
  /**
   * Get popular routes
   */
  async getPopularRoutes(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT 
          orig.code as origin_code,
          orig.city as origin_city,
          dest.code as destination_code,
          dest.city as destination_city,
          COUNT(*) as booking_count,
          MIN(f.price) as min_price
        FROM public.bookings b
        JOIN public.flights f ON b.flight_id = f.id
        JOIN public.airports orig ON f.origin_airport_id = orig.id
        JOIN public.airports dest ON f.destination_airport_id = dest.id
        WHERE b.status IN ('confirmed', 'completed')
        GROUP BY orig.code, orig.city, dest.code, dest.city
        ORDER BY booking_count DESC
        LIMIT $1
      `, [limit]);
      
      return result.rows;
      
    } catch (error) {
      logger.error('Get popular routes error:', error);
      throw error;
    }
  }
  
  /**
   * Calculate flight duration in minutes
   */
  calculateDuration(departureTime, arrivalTime) {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    return Math.round((arrival - departure) / (1000 * 60));
  }
  
  /**
   * Update flight status
   */
  async updateFlightStatus(flightId, status) {
    try {
      const result = await pool.query(`
        UPDATE public.flights 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, flight_number, status
      `, [status, flightId]);
      
      if (result.rows.length === 0) {
        throw new Error('Flight not found');
      }
      
      logger.info('Flight status updated', { flightId, status });
      return result.rows[0];
      
    } catch (error) {
      logger.error('Update flight status error:', error);
      throw error;
    }
  }
  
  /**
   * Check seat availability
   */
  async checkSeatAvailability(flightId, requiredSeats) {
    try {
      const result = await pool.query(`
        SELECT available_seats
        FROM public.flights
        WHERE id = $1
      `, [flightId]);
      
      if (result.rows.length === 0) {
        throw new Error('Flight not found');
      }
      
      return result.rows[0].available_seats >= requiredSeats;
      
    } catch (error) {
      logger.error('Check seat availability error:', error);
      throw error;
    }
  }
}

module.exports = new FlightService();