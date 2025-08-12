import { Header } from "@/components/Header";
import { FlightSearchForm } from "@/components/FlightSearchForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Shield, Clock, Award } from "lucide-react";
import heroImage from "@/assets/hero-aviation.jpg";

const Home = () => {
  const popularDestinations = [
    { city: "Rio de Janeiro", code: "GIG", price: "A partir de R$ 280", image: "🏖️" },
    { city: "São Paulo", code: "GRU", price: "A partir de R$ 180", image: "🏙️" },
    { city: "Salvador", code: "SSA", price: "A partir de R$ 320", image: "🌴" },
    { city: "Fortaleza", code: "FOR", price: "A partir de R$ 350", image: "☀️" },
    { city: "Brasília", code: "BSB", price: "A partir de R$ 240", image: "🏛️" },
    { city: "Nova York", code: "JFK", price: "A partir de R$ 1.800", image: "🗽" }
  ];

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Pagamento Seguro",
      description: "Suas transações protegidas com criptografia SSL"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Suporte 24/7",
      description: "Atendimento completo em qualquer horário"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Melhor Preço",
      description: "Garantia do menor preço ou devolvemos a diferença"
    },
    {
      icon: <Plane className="w-6 h-6" />,
      title: "Voos Nacionais e Internacionais",
      description: "Mais de 500 destinos ao redor do mundo"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-clouds">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-sky opacity-90" />
        
        <div className="relative container mx-auto text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Voe para qualquer lugar
              <span className="block text-primary-glow">do mundo</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Encontre as melhores ofertas de passagens aéreas para destinos nacionais e internacionais. 
              Reserve agora e comece sua próxima aventura!
            </p>
          </div>
          
          <FlightSearchForm />
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Destinos Populares</h2>
            <p className="text-muted-foreground text-lg">
              Descubra os destinos mais procurados com os melhores preços
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularDestinations.map((destination, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer transition-bounce hover:scale-105 hover:shadow-flight"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{destination.city}</h3>
                      <Badge variant="secondary">{destination.code}</Badge>
                    </div>
                    <div className="text-4xl">{destination.image}</div>
                  </div>
                  <p className="text-primary font-semibold">{destination.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Por que escolher a AeroFly?</h2>
            <p className="text-muted-foreground text-lg">
              Sua jornada começa com a confiança e qualidade que você merece
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-smooth">
                  <div className="text-primary">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-gradient-sunset">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Receba as melhores ofertas
            </h2>
            <p className="text-primary-foreground/90 mb-8">
              Cadastre-se em nossa newsletter e seja o primeiro a saber sobre promoções exclusivas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-primary-foreground transition-smooth"
              />
              <button className="px-6 py-3 bg-primary-foreground text-primary font-semibold rounded-lg hover:bg-primary-foreground/90 transition-smooth">
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Plane className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AeroFly</span>
              </div>
              <p className="text-muted-foreground">
                Sua agência de viagens online de confiança. 
                Voando alto desde 2024.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Serviços</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Passagens Aéreas</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Check-in Online</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Status do Voo</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Cancelamentos</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Fale Conosco</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Termos de Uso</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>📞 0800 123 4567</p>
                <p>✉️ contato@aerofly.com</p>
                <p>📍 Garanhuns, PE - Brasil</p>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 AeroFly. Todos os direitos reservados ao 4 TI - TARDE.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;