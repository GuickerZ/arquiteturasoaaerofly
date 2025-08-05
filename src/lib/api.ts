// API Configuration for AeroFly Backend
const API_BASE_URL = 'http://localhost:3001/api';

// Types
export interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  status: string;
  aircraft_type: string;
  airline_name: string;
  airline_code: string;
  airline_logo?: string;
  origin_airport: string;
  origin_code: string;
  origin_city: string;
  destination_airport: string;
  destination_code: string;
  destination_city: string;
  duration: number; // in minutes
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Error Class
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// Base API function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(errorData.message || `HTTP ${response.status}`, response.status);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or server unavailable', 0);
  }
}

// Flight API
export const flightAPI = {
  // Search flights
  search: async (params: FlightSearchParams): Promise<ApiResponse<Flight[]>> => {
    const searchParams = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      passengers: params.passengers.toString(),
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
    });

    if (params.returnDate) {
      searchParams.append('returnDate', params.returnDate);
    }

    return apiRequest<ApiResponse<Flight[]>>(`/flights/search?${searchParams}`);
  },

  // Get flight by ID
  getById: async (id: string): Promise<ApiResponse<Flight>> => {
    return apiRequest<ApiResponse<Flight>>(`/flights/${id}`);
  },

  // Get airports
  getAirports: async (): Promise<ApiResponse<Airport[]>> => {
    return apiRequest<ApiResponse<Airport[]>>('/flights/airports');
  },

  // Get popular routes
  getPopularRoutes: async (limit = 10): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>(`/flights/popular-routes?limit=${limit}`);
  }
};

// User API
export const userAPI = {
  // Get user profile
  getProfile: async (token: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Update user profile
  updateProfile: async (token: string, data: any): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/users/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
  }
};

// Auth API
export const authAPI = {
  // Login
  login: async (email: string, password: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  // Register
  register: async (userData: any): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Refresh token
  refreshToken: async (token: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Booking API
export const bookingAPI = {
  // Create booking
  create: async (token: string, bookingData: any): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/bookings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
  },

  // Get user bookings
  getUserBookings: async (token: string, page = 1, limit = 10): Promise<ApiResponse<any[]>> => {
    return apiRequest<ApiResponse<any[]>>(`/bookings?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Get booking by ID
  getById: async (token: string, id: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Payment API
export const paymentAPI = {
  // Create PIX payment
  createPixPayment: async (token: string, bookingId: string, amount: number): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/payments/pix', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bookingId, amount })
    });
  },

  // Get payment by booking ID
  getByBookingId: async (token: string, bookingId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/payments/booking/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },

  // Check payment status
  checkStatus: async (token: string, paymentId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/payments/${paymentId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

export default {
  flights: flightAPI,
  users: userAPI,
  auth: authAPI,
  bookings: bookingAPI,
  payments: paymentAPI
};