// Mock data para simular backend - preparado para arquitetura SOA

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: Airport;
    time: string;
    terminal?: string;
  };
  arrival: {
    airport: Airport;
    time: string;
    terminal?: string;
  };
  duration: string;
  price: number;
  currency: string;
  aircraft: string;
  availableSeats: number;
  class: 'economy' | 'business' | 'first';
}

export interface User {
  id: string;
  email: string;
  name: string;
  document: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Booking {
  id: string;
  userId: string;
  flights: Flight[];
  passengers: Passenger[];
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingDate: string;
  paymentMethod: string;
}

export interface Passenger {
  id: string;
  name: string;
  document: string;
  dateOfBirth: string;
  nationality: string;
  seatNumber?: string;
}

// Mock Airports - principais aeroportos brasileiros e internacionais
export const mockAirports: Airport[] = [
  { code: 'GRU', name: 'Aeroporto Internacional de São Paulo/Guarulhos', city: 'São Paulo', country: 'Brasil' },
  { code: 'CGH', name: 'Aeroporto de Congonhas', city: 'São Paulo', country: 'Brasil' },
  { code: 'GIG', name: 'Aeroporto Internacional Tom Jobim', city: 'Rio de Janeiro', country: 'Brasil' },
  { code: 'SDU', name: 'Aeroporto Santos Dumont', city: 'Rio de Janeiro', country: 'Brasil' },
  { code: 'BSB', name: 'Aeroporto Internacional de Brasília', city: 'Brasília', country: 'Brasil' },
  { code: 'CNF', name: 'Aeroporto Internacional Tancredo Neves', city: 'Belo Horizonte', country: 'Brasil' },
  { code: 'SSA', name: 'Aeroporto Internacional de Salvador', city: 'Salvador', country: 'Brasil' },
  { code: 'REC', name: 'Aeroporto Internacional do Recife', city: 'Recife', country: 'Brasil' },
  { code: 'FOR', name: 'Aeroporto Internacional Pinto Martins', city: 'Fortaleza', country: 'Brasil' },
  { code: 'POA', name: 'Aeroporto Internacional Salgado Filho', city: 'Porto Alegre', country: 'Brasil' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'Nova York', country: 'Estados Unidos' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'Estados Unidos' },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'Londres', country: 'Reino Unido' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'França' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Espanha' },
];

// Mock Airlines
export const mockAirlines = [
  'LATAM', 'Azul', 'GOL', 'Avianca', 'American Airlines', 'Air France', 'Lufthansa', 'TAP', 'Emirates'
];

// Função para gerar voos mockados
export const generateMockFlights = (
  origin: string,
  destination: string,
  departureDate: string,
  passengers: number = 1
): Flight[] => {
  const originAirport = mockAirports.find(a => a.code === origin);
  const destAirport = mockAirports.find(a => a.code === destination);
  
  if (!originAirport || !destAirport) return [];

  const flights: Flight[] = [];
  const airlines = mockAirlines;
  const aircraft = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A350', 'Embraer E-Jet'];
  
  for (let i = 0; i < 5; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const basePrice = Math.floor(Math.random() * 800) + 200;
    
    flights.push({
      id: `FL${Date.now()}-${i}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}`,
      departure: {
        airport: originAirport,
        time: `${String(6 + i * 3).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        terminal: Math.random() > 0.5 ? `Terminal ${Math.floor(Math.random() * 3) + 1}` : undefined
      },
      arrival: {
        airport: destAirport,
        time: `${String(8 + i * 3).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        terminal: Math.random() > 0.5 ? `Terminal ${Math.floor(Math.random() * 3) + 1}` : undefined
      },
      duration: `${Math.floor(Math.random() * 8) + 1}h ${Math.floor(Math.random() * 60)}min`,
      price: basePrice * passengers,
      currency: 'BRL',
      aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
      availableSeats: Math.floor(Math.random() * 50) + 10,
      class: 'economy'
    });
  }
  
  return flights.sort((a, b) => a.price - b.price);
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'joao@email.com',
    name: 'João Silva',
    document: '123.456.789-00',
    phone: '(11) 99999-9999',
    dateOfBirth: '1990-05-15',
    nationality: 'Brasileira'
  }
];

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'BK001',
    userId: 'user1',
    flights: [],
    passengers: [
      {
        id: 'pass1',
        name: 'João Silva',
        document: '123.456.789-00',
        dateOfBirth: '1990-05-15',
        nationality: 'Brasileira',
        seatNumber: '12A'
      }
    ],
    totalPrice: 450,
    currency: 'BRL',
    status: 'confirmed',
    bookingDate: '2024-01-15',
    paymentMethod: 'Cartão de Crédito'
  }
];

// Simulação de APIs - estas funções simularão as chamadas futuras para o backend SOA

export const mockAPI = {
  // Authentication Service
  auth: {
    login: async (email: string, password: string): Promise<User | null> => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay da API
      const user = mockUsers.find(u => u.email === email);
      return user || null;
    },
    
    register: async (userData: Omit<User, 'id'>): Promise<User> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser = { ...userData, id: `user${Date.now()}` };
      mockUsers.push(newUser);
      return newUser;
    }
  },

  // Flight Search Service
  flights: {
    search: async (params: {
      origin: string;
      destination: string;
      departureDate: string;
      returnDate?: string;
      passengers: number;
      class?: string;
    }): Promise<Flight[]> => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateMockFlights(
        params.origin,
        params.destination,
        params.departureDate,
        params.passengers
      );
    },
    
    getById: async (id: string): Promise<Flight | null> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Simula busca por ID
      return null;
    }
  },

  // Booking Service
  bookings: {
    create: async (bookingData: Omit<Booking, 'id' | 'bookingDate'>): Promise<Booking> => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newBooking: Booking = {
        ...bookingData,
        id: `BK${Date.now()}`,
        bookingDate: new Date().toISOString().split('T')[0]
      };
      mockBookings.push(newBooking);
      return newBooking;
    },
    
    getUserBookings: async (userId: string): Promise<Booking[]> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockBookings.filter(b => b.userId === userId);
    },
    
    getById: async (id: string): Promise<Booking | null> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const booking = mockBookings.find(b => b.id === id);
      if (!booking) {
        // Criar uma reserva mock se não encontrar
        return {
          id,
          userId: 'user1',
          flights: [],
          passengers: [
            {
              id: 'pass1',
              name: 'João Silva',
              document: '123.456.789-00',
              dateOfBirth: '1990-05-15',
              nationality: 'Brasileira',
              seatNumber: '12A'
            }
          ],
          totalPrice: 450,
          currency: 'BRL',
          status: 'confirmed',
          bookingDate: '2024-01-15',
          paymentMethod: 'Cartão de Crédito'
        };
      }
      return booking;
    }
  },

  // Airport Service
  airports: {
    search: async (query: string): Promise<Airport[]> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockAirports.filter(
        airport => 
          airport.code.toLowerCase().includes(query.toLowerCase()) ||
          airport.name.toLowerCase().includes(query.toLowerCase()) ||
          airport.city.toLowerCase().includes(query.toLowerCase())
      );
    },
    
    getAll: async (): Promise<Airport[]> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockAirports;
    }
  }
};