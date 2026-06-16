# PXBR Breed API

API REST do PXBR Breed, desenvolvida com NestJS, TypeORM, PostgreSQL, JWT, Swagger e Jest.

Esta API centraliza a persistência e as regras de backend para o sistema PXBR Breed, incluindo autenticação, clientes, encomendas, Pokemons das encomendas, histórico de status, transações, Pokemons próprios, Hidden Abilities, configurações, relatórios e backup.

## Status

Projeto em desenvolvimento ativo.

Arquitetura atual:

Produção:
Frontend Vercel -> API Render -> PostgreSQL Supabase

Desenvolvimento local:
Frontend Live Server -> API Docker/local -> PostgreSQL Docker

## Links

### Produção:
Health check produção:
https://pxbr-breed-api.onrender.com/api/health

Swagger produção:
https://pxbr-breed-api.onrender.com/api/docs

### Local:
Health check local:
http://127.0.0.1:3001/api/health

Swagger local:
http://127.0.0.1:3001/api/docs

## Tecnologias
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Docker
- JWT
- Refresh token via cookie
- Swagger
- Jest
- Helmet
- CORS
- Rate limiting
- Class Validator
- Class Transformer

## Módulos
src/
  auth/
  backup/
  common/
  database/
  order-status-history/
  orders/
  owned-has/
  owned-pokemons/
  players/
  reports/
  settings/
  transactions/
  users/

## Principais Recursos

### Auth
- Login com e-mail e senha
- Access token JWT
- Refresh token em cookie HTTP-only
- Rotação de refresh token
- Logout
- Rota /auth/me
- Seed automático de usuário admin via variáveis de ambiente

### Players
- CRUD de clientes
- Busca por nick
- Validação de nick duplicado
- Integração com encomendas e transações

### Orders
- CRUD de encomendas
- Relacionamento com player
- Múltiplos Pokemons por encomenda
- Valores: subtotal, desconto, total, pago e pendente
- Arquivamento lógico via campo archived
- Status por Pokemon
- Forma regional
- Nature
- Ability
- Breed base

### Order Status History
- Histórico de avanço de status
- Registro de status anterior e novo status
- Pokemon relacionado
- Encomenda relacionada
- Observações opcionais

### Transactions
- Transações vinculadas a player e order
- Registro de pagamentos
- Integração com relatórios e dashboard

### Owned Pokemons
- Cadastro de Pokemons próprios
- Status de breed
- Gênero
- Nature
- Forma regional
- Egg Groups
- Linha evolutiva
- Observações

### Owned Hidden Abilities
- Cadastro de HAs próprias
- Nature opcional
- Valores castrado e breedável
- Linha evolutiva
- Forma regional
- Observações

### Backup
- Exportação JSON
- Importação JSON
- Normalização de dados legados
- =Importação incremental
- Validação de dependências
- Suporte a dados antigos vindos do frontend/localStorage

### Settings
- Configurações do sistema
- Persistência centralizada

### Reports
- Pokemons mais vendidos
- HAs mais vendidas
- Players que mais compraram
-Players que mais devem
- Resumo da dashboard
- Receita por dia
- Encomendas por dia
- Encomendas por status
- Vendas HA vs regular
- Pagamentos por player
- Resumo financeiro

## Endpoints Principais

Todas as rotas usam prefixo global:
/api

### Health
GET /api/health

### Auth
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me

### Players
GET    /api/players
GET    /api/players/:id
POST   /api/players
PATCH  /api/players/:id
DELETE /api/players/:id

### Orders
GET    /api/orders
GET    /api/orders/:id
POST   /api/orders
PATCH  /api/orders/:id
DELETE /api/orders/:id

Filtros iniciais suportados em GET /api/orders:
playerId
status
archived
paymentStatus
search

### Transactions
GET   /api/transactions
GET   /api/transactions/:id
POST  /api/transactions
PATCH /api/transactions/:id

### Order Status History
GET  /api/order-status-history
GET  /api/order-status-history/order/:orderId
POST /api/order-status-history

### Owned Pokemons
GET    /api/owned-pokemons
GET    /api/owned-pokemons/:id
POST   /api/owned-pokemons
PATCH  /api/owned-pokemons/:id
DELETE /api/owned-pokemons/:id

### Owned Hidden Abilities
GET    /api/owned-has
GET    /api/owned-has/:id
POST   /api/owned-has
PATCH  /api/owned-has/:id
DELETE /api/owned-has/:id

### Backup
GET  /api/backup/export
POST /api/backup/import

### Settings
GET   /api/settings
PATCH /api/settings

### Reports
GET /api/reports/top-selling-pokemons
GET /api/reports/top-selling-has
GET /api/reports/top-buying-players
GET /api/reports/players-debt
GET /api/reports/dashboard-summary
GET /api/reports/revenue-by-day
GET /api/reports/orders-by-status
GET /api/reports/orders-by-day
GET /api/reports/ha-vs-regular-sales
GET /api/reports/payments-by-player
GET /api/reports/revenue-summary

## Autenticação

Após login, a API retorna:
{
  "user": {
    "id": "user-id",
    "email": "admin@pxbr.local",
    "role": "ADMIN"
  },
  "accessToken": "jwt-access-token"
}

O frontend envia o access token no header:
Authorization: Bearer <token>

O refresh token é salvo em cookie HTTP-only.

## Setup Local com Docker

Subir API e Postgres:
docker compose up -d --build

Ver containers:
docker ps

Health check:
http://127.0.0.1:3001/api/health

Swagger:
http://127.0.0.1:3001/api/docs

Logs da API:
docker logs -f pxbr-breed-api

Parar containers sem remover:
docker compose stop

Subir containers existentes:
docker compose start

Rebuildar após mudanças no backend:
docker compose up -d --build


## Setup Local sem Docker

Instalar dependências:
npm install

Rodar migrations:
npm run migration:run

Iniciar em modo desenvolvimento:
npm run start:dev

## Variáveis de Ambiente

Crie um arquivo .env baseado em .env.example.

## Banco de Dados

Banco Local:
PostgreSQL em Docker
Database: pxbr_breed
User: postgres
Password: postgres
Port: 5432

Banco de Produção:
Supabase PostgreSQL

O projeto usa migrations TypeORM. Em produção, não use synchronize=true.

### Migrations

Gerar migration:
npm run migration:generate -- ./src/database/migrations/MigrationName

Criar migration vazia:
npm run migration:create -- ./src/database/migrations/MigrationName

Rodar migrations:
npm run migration:run

Ver status:
npm run migration:show

Reverter última migration:
npm run migration:revert

### Scripts

Build:
npm run build

Desenvolvimento:
npm run start:dev

Produção
npm run start:prod

Render:
npm run start:render

Testes:
npm run test

Testes com coverage:
npm run test:cov

Lint:
npm run lint

Format:
npm run format

## Testes

O projeto possui testes unitários com Jest para controllers e services dos módulos principais.

Rodar todos:
npm run test

## Swagger

Documentação interativa:
/api/docs

Local:
http://127.0.0.1:3001/api/docs

Produção:
https://pxbr-breed-api.onrender.com/api/docs

## Deploy

A API está publicada no Render.

Configuração recomendada:

Build Command:
npm install && npm run build

Start Command:
npm run start:render

Banco de produção:
Supabase PostgreSQL

Frontend permitido no CORS:
https://pxbr-breed.vercel.app

### Observações de Produção

- Use DATABASE_SSL=true com Supabase.
- Use secrets fortes para JWT.
- Não versione .env.
- Não versione arquivos .sqlite.
- Use migrations para qualquer alteração estrutural no banco.
- O Render Free pode demorar alguns segundos no primeiro acesso após inatividade.

## Autor

Desenvolvido por Alvaro Carneiro Junior.
LinkedIn: https://www.linkedin.com/in/alvaro-carneiro-junior-9a376038a/
