import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Calendar as CalendarIcon, Users, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { mockAirports } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";

export const FlightSearchForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: undefined as Date | undefined,
    returnDate: undefined as Date | undefined,
    passengers: 1,
    tripType: "one-way" as "one-way" | "round-trip"
  });

  const [showOriginList, setShowOriginList] = useState(false);
  const [showDestinationList, setShowDestinationList] = useState(false);
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  const filteredOriginAirports = mockAirports.filter(airport =>
    airport.code.toLowerCase().includes(originSearch.toLowerCase()) ||
    airport.city.toLowerCase().includes(originSearch.toLowerCase()) ||
    airport.name.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDestinationAirports = mockAirports.filter(airport =>
    airport.code.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    airport.city.toLowerCase().includes(destinationSearch.toLowerCase()) ||
    airport.name.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  const handleSwapAirports = () => {
    setFormData(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
    setOriginSearch(destinationSearch);
    setDestinationSearch(originSearch);
  };

  const handleSearch = () => {
    if (!formData.origin || !formData.destination || !formData.departureDate) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const searchParams = new URLSearchParams({
      origin: formData.origin,
      destination: formData.destination,
      departureDate: format(formData.departureDate, "yyyy-MM-dd"),
      passengers: formData.passengers.toString(),
      tripType: formData.tripType
    });

    if (formData.returnDate) {
      searchParams.append("returnDate", format(formData.returnDate, "yyyy-MM-dd"));
    }

    navigate(`/flights?${searchParams.toString()}`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-flight border-0 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Trip Type Selection */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={formData.tripType === "one-way" ? "default" : "outline"}
            onClick={() => setFormData(prev => ({ ...prev, tripType: "one-way" }))}
            className="transition-smooth"
          >
            Só Ida
          </Button>
          <Button
            variant={formData.tripType === "round-trip" ? "default" : "outline"}
            onClick={() => setFormData(prev => ({ ...prev, tripType: "round-trip" }))}
            className="transition-smooth"
          >
            Ida e Volta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Origin */}
          <div className="md:col-span-3 relative">
            <Label htmlFor="origin" className="text-sm font-medium mb-2 block">
              <MapPin className="w-4 h-4 inline mr-1" />
              Origem
            </Label>
            <Popover open={showOriginList} onOpenChange={setShowOriginList}>
              <PopoverTrigger asChild>
                <Input
                  id="origin"
                  placeholder="De onde?"
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  onFocus={() => setShowOriginList(true)}
                  className="cursor-pointer"
                />
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="max-h-60 overflow-y-auto">
                  {filteredOriginAirports.map((airport) => (
                    <div
                      key={airport.code}
                      className="px-4 py-3 hover:bg-accent cursor-pointer border-b transition-smooth"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, origin: airport.code }));
                        setOriginSearch(`${airport.code} - ${airport.city}`);
                        setShowOriginList(false);
                      }}
                    >
                      <div className="font-medium">{airport.code} - {airport.city}</div>
                      <div className="text-sm text-muted-foreground">{airport.name}</div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapAirports}
              className="transition-bounce hover:rotate-180"
            >
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Destination */}
          <div className="md:col-span-3 relative">
            <Label htmlFor="destination" className="text-sm font-medium mb-2 block">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destino
            </Label>
            <Popover open={showDestinationList} onOpenChange={setShowDestinationList}>
              <PopoverTrigger asChild>
                <Input
                  id="destination"
                  placeholder="Para onde?"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  onFocus={() => setShowDestinationList(true)}
                  className="cursor-pointer"
                />
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="max-h-60 overflow-y-auto">
                  {filteredDestinationAirports.map((airport) => (
                    <div
                      key={airport.code}
                      className="px-4 py-3 hover:bg-accent cursor-pointer border-b transition-smooth"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, destination: airport.code }));
                        setDestinationSearch(`${airport.code} - ${airport.city}`);
                        setShowDestinationList(false);
                      }}
                    >
                      <div className="font-medium">{airport.code} - {airport.city}</div>
                      <div className="text-sm text-muted-foreground">{airport.name}</div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Departure Date */}
          <div className="md:col-span-2">
            <Label className="text-sm font-medium mb-2 block">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Partida
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {formData.departureDate ? (
                    format(formData.departureDate, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span className="text-muted-foreground">Selecione</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.departureDate}
                  onSelect={(date) => setFormData(prev => ({ ...prev, departureDate: date }))}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Return Date */}
          {formData.tripType === "round-trip" && (
            <div className="md:col-span-2">
              <Label className="text-sm font-medium mb-2 block">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Retorno
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {formData.returnDate ? (
                      format(formData.returnDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span className="text-muted-foreground">Selecione</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.returnDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, returnDate: date }))}
                    disabled={(date) => date < (formData.departureDate || new Date())}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Passengers */}
          <div className={`${formData.tripType === "round-trip" ? "md:col-span-1" : "md:col-span-2"}`}>
            <Label className="text-sm font-medium mb-2 block">
              <Users className="w-4 h-4 inline mr-1" />
              Passageiros
            </Label>
            <Select
              value={formData.passengers.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, passengers: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? "Passageiro" : "Passageiros"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className={`${formData.tripType === "round-trip" ? "md:col-span-1" : "md:col-span-1"}`}>
            <Button 
              onClick={handleSearch}
              className="w-full shadow-flight transition-bounce hover:scale-105"
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};