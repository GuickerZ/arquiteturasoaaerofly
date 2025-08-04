-- Create enum types
CREATE TYPE flight_status AS ENUM ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled', 'delayed');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE payment_method AS ENUM ('pix', 'credit_card', 'debit_card', 'bank_transfer');

-- Create airlines table
CREATE TABLE public.airlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create airports table
CREATE TABLE public.airports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    timezone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create flights table
CREATE TABLE public.flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_number TEXT NOT NULL,
    airline_id UUID REFERENCES public.airlines(id) NOT NULL,
    origin_airport_id UUID REFERENCES public.airports(id) NOT NULL,
    destination_airport_id UUID REFERENCES public.airports(id) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL DEFAULT 0,
    total_seats INTEGER NOT NULL DEFAULT 180,
    status flight_status DEFAULT 'scheduled',
    aircraft_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    document TEXT,
    phone TEXT,
    birth_date DATE,
    nationality TEXT DEFAULT 'Brasileira',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    flight_id UUID REFERENCES public.flights(id) NOT NULL,
    booking_reference TEXT UNIQUE NOT NULL,
    status booking_status DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    passengers_count INTEGER NOT NULL DEFAULT 1,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create passengers table
CREATE TABLE public.passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    document TEXT NOT NULL,
    birth_date DATE NOT NULL,
    nationality TEXT DEFAULT 'Brasileira',
    seat_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    pix_code TEXT,
    pix_expires_at TIMESTAMP WITH TIME ZONE,
    transaction_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.airlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Airlines and airports are public read
CREATE POLICY "Airlines are viewable by everyone" ON public.airlines FOR SELECT USING (true);
CREATE POLICY "Airports are viewable by everyone" ON public.airports FOR SELECT USING (true);
CREATE POLICY "Flights are viewable by everyone" ON public.flights FOR SELECT USING (true);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Passengers policies
CREATE POLICY "Users can view passengers of own bookings" ON public.passengers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Users can create passengers for own bookings" ON public.passengers FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = passengers.booking_id AND bookings.user_id = auth.uid())
);

-- Payments policies
CREATE POLICY "Users can view payments of own bookings" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid())
);
CREATE POLICY "Users can create payments for own bookings" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid())
);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_airlines_updated_at BEFORE UPDATE ON public.airlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_airports_updated_at BEFORE UPDATE ON public.airports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON public.flights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_passengers_updated_at BEFORE UPDATE ON public.passengers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
-- Airlines
INSERT INTO public.airlines (name, code, logo_url) VALUES
('AeroFly', 'AF', '/api/placeholder/100/100'),
('LATAM Airlines', 'LA', '/api/placeholder/100/100'),
('Gol Linhas Aéreas', 'G3', '/api/placeholder/100/100'),
('Azul Linhas Aéreas', 'AD', '/api/placeholder/100/100');

-- Airports
INSERT INTO public.airports (name, code, city, country, timezone) VALUES
('Aeroporto Internacional de São Paulo', 'GRU', 'São Paulo', 'Brasil', 'America/Sao_Paulo'),
('Aeroporto Santos Dumont', 'SDU', 'Rio de Janeiro', 'Brasil', 'America/Sao_Paulo'),
('Aeroporto Internacional de Brasília', 'BSB', 'Brasília', 'Brasil', 'America/Sao_Paulo'),
('Aeroporto Internacional de Salvador', 'SSA', 'Salvador', 'Brasil', 'America/Bahia'),
('Aeroporto Internacional de Fortaleza', 'FOR', 'Fortaleza', 'Brasil', 'America/Fortaleza'),
('Aeroporto Internacional de Recife', 'REC', 'Recife', 'Brasil', 'America/Recife');

-- Flights (sample data for next 7 days)
INSERT INTO public.flights (flight_number, airline_id, origin_airport_id, destination_airport_id, departure_time, arrival_time, price, available_seats, total_seats, aircraft_type) 
SELECT 
    'AF' || LPAD((ROW_NUMBER() OVER())::TEXT, 4, '0'),
    (SELECT id FROM public.airlines WHERE code = 'AF'),
    orig.id,
    dest.id,
    NOW() + (days || ' days')::INTERVAL + (hours || ' hours')::INTERVAL,
    NOW() + (days || ' days')::INTERVAL + (hours + duration || ' hours')::INTERVAL,
    (300 + (RANDOM() * 500))::DECIMAL(10,2),
    (120 + (RANDOM() * 60))::INTEGER,
    180,
    CASE WHEN RANDOM() < 0.5 THEN 'Boeing 737' ELSE 'Airbus A320' END
FROM 
    public.airports orig,
    public.airports dest,
    generate_series(1, 7) days,
    generate_series(6, 22, 4) hours,
    (VALUES (2), (3), (4), (5)) AS durations(duration)
WHERE orig.id != dest.id
LIMIT 50;