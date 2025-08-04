# AeroFly API - Backend com Arquitetura SOA

API REST completa para o sistema de reservas aéreas AeroFly, desenvolvida com Node.js, Express e PostgreSQL seguindo os princípios de Service-Oriented Architecture (SOA).

## 🏗️ Arquitetura SOA

O sistema foi estruturado seguindo os princípios SOA com separação clara de responsabilidades:

### Camadas da Arquitetura

1. **Controllers** - Camada de apresentação que gerencia requisições HTTP
2. **Services** - Camada de lógica de negócio e regras de domínio
3. **Database** - Camada de acesso a dados com PostgreSQL
4. **Middleware** - Componentes transversais (auth, validação, logs)
5. **Routes** - Definição e organização de endpoints

### Serviços Implementados

- **AuthService** - Autenticação e autorização
- **FlightService** - Gestão de voos e aeroportos
- **BookingService** - Sistema de reservas
- **PaymentService** - Processamento de pagamentos (PIX)
- **UserService** - Gestão de perfis de usuários

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação via tokens
- **bcryptjs** - Hash de senhas
- **QRCode** - Geração de QR codes para PIX
- **express-validator** - Validação de dados
- **helmet** - Segurança HTTP
- **morgan** - Logging de requisições
- **compression** - Compressão de respostas

## 📁 Estrutura do Projeto

```
API/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do PostgreSQL
│   ├── controllers/             # Controladores HTTP
│   │   ├── authController.js
│   │   ├── flightController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   └── userController.js
│   ├── services/                # Lógica de negócio
│   │   ├── authService.js
│   │   ├── flightService.js
│   │   ├── bookingService.js
│   │   ├── paymentService.js
│   │   └── userService.js
│   ├── middleware/              # Middleware personalizados
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── routes/                  # Definição de rotas
│   │   ├── auth.js
│   │   ├── flights.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   └── users.js
│   ├── utils/                   # Utilitários
│   │   ├── helpers.js
│   │   └── logger.js
│   └── index.js                 # Ponto de entrada da aplicação
├── logs/                        # Arquivos de log
├── package.json
├── .env.example
└── README.md
```

## 📊 Modelo de Dados

### Principais Entidades

- **Users** - Usuários do sistema (auth.users)
- **Profiles** - Perfis dos usuários (public.profiles)
- **Airlines** - Companhias aéreas (public.airlines)
- **Airports** - Aeroportos (public.airports)
- **Flights** - Voos (public.flights)
- **Bookings** - Reservas (public.bookings)
- **Passengers** - Passageiros (public.passengers)
- **Payments** - Pagamentos (public.payments)

## 🔐 Autenticação e Segurança

### JWT Authentication
- Tokens JWT para autenticação stateless
- Refresh tokens para renovação segura
- Middleware de autenticação obrigatória/opcional

### Segurança Implementada
- Hash bcrypt para senhas (12 rounds)
- Rate limiting por IP
- Helmet para headers de segurança
- Validação rigorosa de entrada
- CORS configurado
- Logs de segurança

## 💳 Sistema de Pagamentos PIX

### Funcionalidades PIX
- Geração de códigos PIX únicos
- QR codes automáticos para pagamento
- Webhook para confirmação de pagamento
- Simulação de pagamentos (desenvolvimento)
- Expiração automática (30 minutos)

### Fluxo de Pagamento
1. Usuário seleciona PIX como método
2. Sistema gera código PIX e QR code
3. Usuário efetua pagamento via app bancário
4. Webhook confirma o pagamento
5. Reserva é automaticamente confirmada

## 🛩️ Sistema de Reservas

### Funcionalidades de Reservas
- Busca de voos por origem/destino/data
- Verificação de disponibilidade de assentos
- Criação de reservas com múltiplos passageiros
- Geração automática de assentos
- Cancelamento com reembolso de assentos
- Histórico completo de reservas

### Estados da Reserva
- **pending** - Aguardando pagamento
- **confirmed** - Pagamento confirmado
- **completed** - Viagem realizada
- **cancelled** - Reserva cancelada

## 📋 API Endpoints

### Autenticação (`/api/auth`)
- `POST /register` - Registro de usuário
- `POST /login` - Login
- `POST /refresh` - Renovar token
- `POST /logout` - Logout
- `POST /forgot-password` - Esqueci senha
- `GET /profile` - Perfil atual

### Voos (`/api/flights`)
- `GET /search` - Buscar voos
- `GET /airports` - Listar aeroportos
- `GET /popular-routes` - Rotas populares
- `GET /:id` - Detalhes do voo
- `GET /:id/availability` - Verificar disponibilidade
- `PUT /:id/status` - Atualizar status (admin)

### Reservas (`/api/bookings`)
- `POST /` - Criar reserva
- `GET /` - Listar reservas do usuário
- `GET /:id` - Detalhes da reserva
- `PUT /:id/status` - Atualizar status
- `DELETE /:id` - Cancelar reserva
- `GET /reference/:ref` - Buscar por referência

### Pagamentos (`/api/payments`)
- `GET /methods` - Métodos disponíveis
- `POST /pix` - Criar pagamento PIX
- `POST /pix/webhook` - Webhook PIX
- `POST /pix/simulate` - Simular pagamento (dev)
- `GET /booking/:id` - Pagamento por reserva
- `GET /:id/status` - Status do pagamento

### Usuários (`/api/users`)
- `GET /profile` - Perfil do usuário
- `PUT /profile` - Atualizar perfil
- `PUT /password` - Alterar senha
- `GET /statistics` - Estatísticas
- `DELETE /account` - Excluir conta

## 🔧 Configuração e Instalação

### 1. Instalar Dependências
```bash
cd API
npm install
```

### 2. Configurar Ambiente
```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Configurar Banco de Dados
```bash
# Criar banco PostgreSQL
createdb aerofly

# As tabelas são criadas automaticamente via migrations do Supabase
```

### 4. Executar Aplicação
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📝 Logs e Monitoramento

### Sistema de Logs
- Logs estruturados em JSON
- Níveis: ERROR, WARN, INFO, DEBUG
- Rotação automática de arquivos
- Logs de auditoria para operações críticas

### Monitoramento
- Health check endpoint (`/health`)
- Métricas de performance
- Logs de erro detalhados
- Rastreamento de transações

## 🧪 Testes

### Executar Testes
```bash
npm test
```

### Tipos de Teste
- Testes unitários dos services
- Testes de integração das APIs
- Testes de carga para endpoints críticos
- Testes de segurança

## 🚀 Deploy

### Variáveis de Ambiente Necessárias
```env
NODE_ENV=production
PORT=3001
DB_HOST=seu-postgres-host
DB_NAME=aerofly
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
JWT_SECRET=seu-jwt-secret-super-seguro
PIX_API_KEY=sua-chave-pix
```

### Considerações de Produção
- Usar HTTPS sempre
- Configurar rate limiting adequado
- Implementar cache Redis para sessões
- Configurar backup automático do banco
- Monitoramento com APM tools
- Load balancer para alta disponibilidade

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger/OpenAPI em:
- Desenvolvimento: `http://localhost:3001/api-docs`
- Produção: `https://api.aerofly.com/api-docs`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Contate o time de desenvolvimento
- Consulte a documentação da API

---

**AeroFly API** - Sistema completo de reservas aéreas com arquitetura SOA robusta e escalável.