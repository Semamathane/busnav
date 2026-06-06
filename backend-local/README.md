# Tshwane BusNav - Backend API

NestJS backend service for the Tshwane Bus Navigation mobile application.

## Prerequisites

- **Node.js** >= 18.18.0 (download from https://nodejs.org)
- **PostgreSQL** >= 14 (download from https://www.postgresql.org/download/windows/)
- **npm** (comes with Node.js)

## Quick Setup (Step by Step)

### Step 1: Install PostgreSQL

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer (remember the password you set for the `postgres` user)
3. Use the default port `5432`
4. After installation, open **pgAdmin** or **psql** and create a new database:

```sql
CREATE DATABASE busnav;
```

### Step 2: Configure Environment

```bash
# Copy the example env file
copy .env.example .env
```

Edit `.env` and update `DATABASE_URL` with your PostgreSQL password:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/busnav"
JWT_SECRET="any-random-string-here"
```

### Step 3: Install Dependencies

```bash
npm install
```

This will also auto-generate the Prisma client (via the `postinstall` script).

### Step 4: Create Database Tables

```bash
npx prisma migrate dev --name init
```

This creates all the required tables in your `busnav` database.

### Step 5: Seed Sample Data

```bash
npx tsx prisma/seed.ts
```

This populates the database with:
- 4 bus routes (CBD→Menlyn, CBD→Mamelodi, Hatfield→Wonderboom, Menlyn→Atteridgeville)
- 25+ bus stops across Tshwane
- 10 buses distributed across routes

### Step 6: Start the Server

```bash
npm run dev
```

The server will start at **http://localhost:3000**

## Quick Setup (One Command)

If PostgreSQL is already installed and the `busnav` database exists:

```bash
npm run setup
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed the database |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs

## API Endpoints

### Auth
- `POST /api/signup` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile (requires auth)

### Routes
- `GET /api/routes` - List all bus routes
- `GET /api/routes/:id` - Get route details with stops

### Stops
- `GET /api/stops` - List all stops
- `GET /api/stops/nearby?lat=X&lng=Y&radius=Z` - Find nearby stops

### Buses
- `GET /api/buses` - List all buses
- `GET /api/buses/route/:routeId` - Get buses on a specific route

## Troubleshooting

### "Can't reach database server"
- Make sure PostgreSQL is running (check Windows Services)
- Verify your DATABASE_URL in `.env` has the correct password
- Ensure the `busnav` database exists

### "Missing script: dev"
- Make sure you're using this updated package.json (not the cloud version)

### Prisma errors
- Run `npx prisma generate` to regenerate the client
- Run `npx prisma migrate reset` to reset and re-create all tables (WARNING: deletes data)
