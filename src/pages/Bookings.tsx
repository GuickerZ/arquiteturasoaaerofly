import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Booking, mockAPI } from "@/lib/mockData";
import { Plane, Calendar, Users, CreditCard, MapPin, ArrowRight, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock user - será substituído por contexto de autenticação
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        navigate("/login?returnUrl=/bookings");
        return;
      }

      setLoading(true);
      try {
        const userBookings = await mockAPI.bookings.getUserBookings(user.id);
        setBookings(userBookings);
      } catch (error) {
        console.error("Erro ao carregar reservas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  if (!user) {
    return null; // Será redirecionado para login
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-clouds">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
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

  return (
    <div className="min-h-screen bg-gradient-clouds">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Minhas Viagens</h1>
          <p className="text-muted-foreground">
            Gerencie suas reservas e acompanhe o status dos seus voos
          </p>
        </div>

        {bookings.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma viagem encontrada</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não fez nenhuma reserva. Que tal planejar sua próxima aventura?
              </p>
              <Button onClick={() => navigate("/")} className="shadow-flight">
                <Plane className="w-4 h-4 mr-2" />
                Buscar Voos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="shadow-card-soft hover:shadow-flight transition-smooth">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Plane className="w-5 h-5 text-primary" />
                        Reserva #{booking.id}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Reservado em {format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{booking.passengers.length} passageiro(s)</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(booking.status)}
                      >
                        {getStatusText(booking.status)}
                      </Badge>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          R$ {booking.totalPrice.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Flight Info - Mock data since flights array might be empty */}
                  <div className="bg-secondary/30 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <div className="text-lg font-semibold">São Paulo (GRU)</div>
                        <div className="text-sm text-muted-foreground">Partida: 08:30</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <div className="h-px bg-border flex-1"></div>
                          <Plane className="w-4 h-4 mx-2 text-primary" />
                          <div className="h-px bg-border flex-1"></div>
                        </div>
                        <div className="text-sm text-muted-foreground">2h 30min</div>
                      </div>
                      
                      <div className="text-right md:text-left">
                        <div className="text-lg font-semibold">Rio de Janeiro (GIG)</div>
                        <div className="text-sm text-muted-foreground">Chegada: 11:00</div>
                      </div>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Passageiros:</h4>
                    <div className="space-y-1">
                      {booking.passengers.map((passenger, index) => (
                        <div key={passenger.id} className="flex justify-between items-center text-sm">
                          <span>{passenger.name}</span>
                          {passenger.seatNumber && (
                            <Badge variant="outline" className="text-xs">
                              Assento {passenger.seatNumber}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="w-4 h-4" />
                      <span>Pago via {booking.paymentMethod}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/booking/${booking.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      
                      {booking.status === "confirmed" && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Implementar check-in online
                            alert("Funcionalidade de check-in será implementada");
                          }}
                        >
                          Check-in Online
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;