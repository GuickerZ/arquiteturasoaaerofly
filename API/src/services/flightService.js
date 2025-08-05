const { supabase } = require('../config/supabase');
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
      
      // Search flights with joins using Supabase
      const { data: flights, error: flightsError, count } = await supabase
        .from('flights')
        .select(`
          id,
          flight_number,
          departure_time,
          arrival_time,
          price,
          available_seats,
          total_seats,
          status,
          aircraft_type,
          airlines!inner(name, code, logo_url),
          origin_airports:airports!flights_origin_airport_id_fkey(name, code, city),
          destination_airports:airports!flights_destination_airport_id_fkey(name, code, city)
        `, { count: 'exact' })
        .eq('origin_airports.code', origin)
        .eq('destination_airports.code', destination)
        .gte('departure_time', departureDate + 'T00:00:00')
        .lt('departure_time', departureDate + 'T23:59:59')
        .gte('available_seats', passengers)
        .eq('status', 'scheduled')
        .order('departure_time', { ascending: true })
        .range(offset, offset + queryLimit - 1);
      
      if (flightsError) {
        throw new Error(`Flight search failed: ${flightsError.message}`);
      }
      
      const formattedFlights = flights.map(flight => ({
        id: flight.id,
        flight_number: flight.flight_number,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        price: flight.price,
        available_seats: flight.available_seats,
        total_seats: flight.total_seats,
        status: flight.status,
        aircraft_type: flight.aircraft_type,
        airline_name: flight.airlines.name,
        airline_code: flight.airlines.code,
        airline_logo: flight.airlines.logo_url,
        origin_airport: flight.origin_airports.name,
        origin_code: flight.origin_airports.code,
        origin_city: flight.origin_airports.city,
        destination_airport: flight.destination_airports.name,
        destination_code: flight.destination_airports.code,
        destination_city: flight.destination_airports.city,
        duration: this.calculateDuration(flight.departure_time, flight.arrival_time)
      }));
      
      const meta = getPaginationMeta(count || 0, page, limit);
      
      return { flights: formattedFlights, meta };
      
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
      const { data: flight, error } = await supabase
        .from('flights')
        .select(`
          id,
          flight_number,
          departure_time,
          arrival_time,
          price,
          available_seats,
          total_seats,
          status,
          aircraft_type,
          airlines!inner(name, code, logo_url),
          origin_airports:airports!flights_origin_airport_id_fkey(name, code, city),
          destination_airports:airports!flights_destination_airport_id_fkey(name, code, city)
        `)
        .eq('id', flightId)
        .single();
      
      if (error) {
        throw new Error('Flight not found');
      }
      
      return {
        id: flight.id,
        flight_number: flight.flight_number,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        price: flight.price,
        available_seats: flight.available_seats,
        total_seats: flight.total_seats,
        status: flight.status,
        aircraft_type: flight.aircraft_type,
        airline_name: flight.airlines.name,
        airline_code: flight.airlines.code,
        airline_logo: flight.airlines.logo_url,
        origin_airport: flight.origin_airports.name,
        origin_code: flight.origin_airports.code,
        origin_city: flight.origin_airports.city,
        destination_airport: flight.destination_airports.name,
        destination_code: flight.destination_airports.code,
        destination_city: flight.destination_airports.city,
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
      const { data: airports, error } = await supabase
        .from('airports')
        .select('id, name, code, city, country')
        .order('city', { ascending: true });
      
      if (error) {
        throw new Error(`Failed to get airports: ${error.message}`);
      }
      
      return airports;
      
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
      const { data: routes, error } = await supabase
        .from('bookings')
        .select(`
          flights!inner(
            origin_airports:airports!flights_origin_airport_id_fkey(code, city),
            destination_airports:airports!flights_destination_airport_id_fkey(code, city),
            price
          )
        `)
        .in('status', ['confirmed', 'completed']);
      
      if (error) {
        throw new Error(`Failed to get popular routes: ${error.message}`);
      }
      
      // Group by route and calculate statistics
      const routeStats = {};
      routes.forEach(booking => {
        const flight = booking.flights;
        const routeKey = `${flight.origin_airports.code}-${flight.destination_airports.code}`;
        
        if (!routeStats[routeKey]) {
          routeStats[routeKey] = {
            origin_code: flight.origin_airports.code,
            origin_city: flight.origin_airports.city,
            destination_code: flight.destination_airports.code,
            destination_city: flight.destination_airports.city,
            booking_count: 0,
            min_price: flight.price
          };
        }
        
        routeStats[routeKey].booking_count++;
        if (flight.price < routeStats[routeKey].min_price) {
          routeStats[routeKey].min_price = flight.price;
        }
      });
      
      return Object.values(routeStats)
        .sort((a, b) => b.booking_count - a.booking_count)
        .slice(0, limit);
      
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
      const { data, error } = await supabase
        .from('flights')
        .update({ status })
        .eq('id', flightId)
        .select('id, flight_number, status')
        .single();
      
      if (error) {
        throw new Error('Flight not found');
      }
      
      logger.info('Flight status updated', { flightId, status });
      return data;
      
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
      const { data, error } = await supabase
        .from('flights')
        .select('available_seats')
        .eq('id', flightId)
        .single();
      
      if (error) {
        throw new Error('Flight not found');
      }
      
      return data.available_seats >= requiredSeats;
      
    } catch (error) {
      logger.error('Check seat availability error:', error);
      throw error;
    }
  }
}

module.exports = new FlightService();