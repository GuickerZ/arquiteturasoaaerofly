import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { flightAPI, Flight as ApiFlight, Airport } from "@/lib/api";
import { Plane, Clock, MapPin, Users, ArrowRight, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Flights = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<ApiFlight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"price" | "duration" | "departure">("price");

  const searchData = {
    origin: searchParams.get("origin") || "",
    destination: searchParams.get("destination") || "",
    departureDate: searchParams.get("departureDate") || "",
    returnDate: searchParams.get("returnDate"),
    passengers: parseInt(searchParams.get("passengers") || "1"),
    tripType: searchParams.get("tripType") || "one-way"
  };

  const originAirport = airports.find(a => a.code === searchData.origin);
  const destinationAirport = airports.find(a => a.code === searchData.destination);

  useEffect(() => {
    // Load airports first
    const loadAirports = async () => {
      try {
        const response = await flightAPI.getAirports();
        setAirports(response.data || []);
      } catch (error) {
        console.error('Failed to load airports:', error);
      }
    };
    
    loadAirports();
  }, []);

  useEffect(() => {
    const searchFlights = async () => {
      setLoading(true);
      try {
        const response = await flightAPI.search({
          origin: searchData.origin,
          destination: searchData.destination,
          departureDate: searchData.departureDate,
          returnDate: searchData.returnDate || undefined,
          passengers: searchData.passengers
        });
        setFlights(response.data || []);
      } catch (error) {
        console.error("Erro ao buscar voos:", error);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchData.origin && searchData.destination && searchData.departureDate) {
      searchFlights();
    }
  }, [searchParams, searchData.origin, searchData.destination, searchData.departureDate, searchData.passengers, searchData.returnDate]);

  const sortedFlights = [...flights].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price;
      case "duration":
        return a.duration.localeCompare(b.duration);
      case "departure":
        return a.departure.time.localeCompare(b.departure.time);
      default:
        return 0;
    }
  });

  const handleSelectFlight = (flight: Flight) => {
    // Simular seleção de voo - será implementado com estado global
    navigate(`/booking/${flight.id}`, { 
      state: { 
        flight, 
        searchData 
      } 
    });
  };

  const handleNewSearch = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-clouds">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!originAirport || !destinationAirport) {
    return (
      <div className="min-h-screen bg-gradient-clouds">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Parâmetros de busca inválidos</h1>
          <Button onClick={handleNewSearch}>
            Nova Busca
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-clouds">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Summary */}
        <Card className="mb-8 shadow-card-soft">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{originAirport.city}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{destinationAirport.city}</span>
                  </div>
                  <Badge variant="secondary">
                    {searchData.passengers} {searchData.passengers === 1 ? "Passageiro" : "Passageiros"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Partida: {format(new Date(searchData.departureDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  {searchData.returnDate && (
                    <span>
                      Retorno: {format(new Date(searchData.returnDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={handleNewSearch}>
                Nova Busca
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4" />
                  <h3 className="font-semibold">Filtros</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ordenar por:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="price">Menor Preço</option>
                      <option value="duration">Menor Duração</option>
                      <option value="departure">Horário de Partida</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Companhias Aéreas</h4>
                    <div className="space-y-2">
                      {["LATAM", "Azul", "GOL", "Avianca"].map((airline) => (
                        <label key={airline} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">{airline}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {flights.length} voos encontrados
              </h2>
              <p className="text-muted-foreground">
                {originAirport.city} → {destinationAirport.city}
              </p>
            </div>

            <div className="space-y-4">
              {sortedFlights.map((flight) => (
                <Card 
                  key={flight.id} 
                  className="hover:shadow-flight transition-bounce cursor-pointer group"
                  onClick={() => handleSelectFlight(flight)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      {/* Flight Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Plane className="w-5 h-5 text-primary" />
                            <span className="font-semibold text-lg">{flight.airline}</span>
                          </div>
                          <Badge variant="outline">{flight.flightNumber}</Badge>
                          <Badge variant="secondary">{flight.aircraft}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 items-center">
                          {/* Departure */}
                          <div>
                            <div className="text-2xl font-bold">{flight.departure.time}</div>
                            <div className="text-sm text-muted-foreground">{flight.departure.airport.code}</div>
                            <div className="text-xs text-muted-foreground">{flight.departure.airport.city}</div>
                            {flight.departure.terminal && (
                              <div className="text-xs text-muted-foreground">{flight.departure.terminal}</div>
                            )}
                          </div>
                          
                          {/* Duration */}
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <div className="h-px bg-border flex-1"></div>
                              <Clock className="w-4 h-4 mx-2 text-muted-foreground" />
                              <div className="h-px bg-border flex-1"></div>
                            </div>
                            <div className="text-sm font-medium">{flight.duration}</div>
                            <div className="text-xs text-muted-foreground">Direto</div>
                          </div>
                          
                          {/* Arrival */}
                          <div className="text-right">
                            <div className="text-2xl font-bold">{flight.arrival.time}</div>
                            <div className="text-sm text-muted-foreground">{flight.arrival.airport.code}</div>
                            <div className="text-xs text-muted-foreground">{flight.arrival.airport.city}</div>
                            {flight.arrival.terminal && (
                              <div className="text-xs text-muted-foreground">{flight.arrival.terminal}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Price and Selection */}
                      <div className="text-right md:text-center min-w-[140px]">
                        <div className="text-3xl font-bold text-primary mb-1">
                          R$ {flight.price.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          para {searchData.passengers} {searchData.passengers === 1 ? "passageiro" : "passageiros"}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full group-hover:scale-105 transition-bounce shadow-flight"
                        >
                          Selecionar
                        </Button>
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{flight.availableSeats} assentos</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {flights.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum voo encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Não encontramos voos para essa rota na data selecionada.
                  </p>
                  <Button onClick={handleNewSearch}>
                    Tentar Nova Busca
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flights;