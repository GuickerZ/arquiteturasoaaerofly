import { Button } from "@/components/ui/button";
import { Plane, User, Menu, History } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Mock user state - será substituído por contexto de autenticação
  const [user, setUser] = useState<any>(null);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <header className="bg-gradient-sky border-b border-border/20 shadow-card-soft">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer transition-smooth hover:scale-105"
            onClick={() => navigate('/')}
          >
            <div className="p-2 bg-background/20 rounded-full backdrop-blur-sm">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary-foreground">
              AeroFly
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10"
              onClick={() => navigate('/')}
            >
              Buscar Voos
            </Button>
            <Button 
              variant="ghost" 
              className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10"
              onClick={() => navigate('/bookings')}
            >
              <History className="w-4 h-4 mr-2" />
              Minhas Viagens
            </Button>
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-primary-foreground/90">
                  Olá, {user.name}
                </span>
                <Button 
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-background/20 text-primary-foreground hover:bg-background/30"
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogin}
                  className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10"
                >
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
                <Button 
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="bg-background/20 text-primary-foreground hover:bg-background/30 border-primary-foreground/20"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary-foreground/20">
            <nav className="flex flex-col space-y-2 mt-4">
              <Button 
                variant="ghost" 
                className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10 justify-start"
                onClick={() => {
                  navigate('/');
                  setIsMenuOpen(false);
                }}
              >
                Buscar Voos
              </Button>
              <Button 
                variant="ghost" 
                className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10 justify-start"
                onClick={() => {
                  navigate('/bookings');
                  setIsMenuOpen(false);
                }}
              >
                <History className="w-4 h-4 mr-2" />
                Minhas Viagens
              </Button>
              
              {user ? (
                <>
                  <div className="px-3 py-2 text-primary-foreground/90">
                    Olá, {user.name}
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10 justify-start"
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      handleLogin();
                      setIsMenuOpen(false);
                    }}
                    className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10 justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                    className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-background/10 justify-start"
                  >
                    Cadastrar
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};