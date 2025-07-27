import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Booking, mockAPI } from "@/lib/mockData";
import { 
  Plane, 
  Calendar, 
  Users, 
  CreditCard, 
  MapPin, 
  ArrowLeft,
  Clock,
  User,
  FileText,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      
      setLoading(true);
      try {
        const bookingData = await mockAPI.bookings.getById(bookingId);
        setBooking(bookingData);
      } catch (error) {
        console.error("Erro ao carregar reserva:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-clouds">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-clouds">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Reserva não encontrada</h3>
              <p className="text-muted-foreground mb-6">
                A reserva solicitada não foi encontrada ou você não tem permissão para visualizá-la.
              </p>
              <Button onClick={() => navigate("/bookings")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Minhas Viagens
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-clouds">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/bookings")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Minhas Viagens
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Detalhes da Reserva</h1>
          <p className="text-muted-foreground">
            Reserva #{booking.id} - {getStatusText(booking.status)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-primary" />
                  Detalhes do Voo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/30 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    <div>
                      <div className="text-2xl font-bold mb-1">São Paulo</div>
                      <div className="text-sm text-muted-foreground mb-2">GRU - Guarulhos</div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">08:30</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Terminal 3</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="h-px bg-border flex-1"></div>
                        <div className="bg-primary rounded-full p-2 mx-3">
                          <Plane className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="h-px bg-border flex-1"></div>
                      </div>
                      <div className="text-sm font-medium mb-1">2h 30min</div>
                      <div className="text-xs text-muted-foreground">LATAM 3847</div>
                      <div className="text-xs text-muted-foreground">Boeing 737</div>
                    </div>
                    
                    <div className="text-right md:text-left">
                      <div className="text-2xl font-bold mb-1">Rio de Janeiro</div>
                      <div className="text-sm text-muted-foreground mb-2">GIG - Tom Jobim</div>
                      <div className="flex items-center gap-2 md:justify-start justify-end">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">11:00</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Terminal 2</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passengers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Passageiros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.passengers.map((passenger, index) => (
                    <div key={passenger.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-full p-2">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{passenger.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {passenger.document} • {format(new Date(passenger.dateOfBirth), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-muted-foreground">{passenger.nationality}</div>
                        </div>
                      </div>
                      {passenger.seatNumber && (
                        <Badge variant="outline" className="bg-background">
                          Assento {passenger.seatNumber}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status and Price */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(booking.status)} text-lg px-4 py-2`}
                  >
                    {getStatusText(booking.status)}
                  </Badge>
                </div>
                
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-1">
                    R$ {booking.totalPrice.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-muted-foreground">Total da viagem</div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data da reserva:</span>
                    <span>{format(new Date(booking.bookingDate), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Forma de pagamento:</span>
                    <span>{booking.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passageiros:</span>
                    <span>{booking.passengers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Comprovante
                  </Button>
                  
                  {booking.status === "confirmed" && (
                    <Button className="w-full">
                      <Plane className="w-4 h-4 mr-2" />
                      Check-in Online
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:suporte@aviacao.com?subject=Dúvida sobre reserva" target="_blank">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Suporte
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;