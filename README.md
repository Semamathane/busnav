# BusNav - Tshwane Bus Navigation App

A real-time bus tracking and navigation application for Tshwane (Pretoria), South Africa.

## 📱 Features

- **Real-time Bus Tracking**: View live bus locations on interactive maps
- **Route Information**: Browse all available routes with detailed stops
- **ETA Predictions**: Get estimated arrival times for buses at stops
- **Nearby Stops**: Find bus stops near your current location
- **Multi-platform**: Works on iOS, Android, and Web

## 🏗️ Project Structure

```
busnav/
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── buses/    # Bus tracking endpoints
│   │   ├── routes/   # Route management
│   │   ├── stops/    # Bus stop services
│   │   └── ...
│   └── package.json
├── frontend/         # React Native Expo Web app
│   ├── app/          # Main app routes
│   ├── components/   # Reusable components
│   ├── contexts/     # React contexts
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (for backend)

### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

Runs on `http://localhost:3000`

### Frontend Setup

```bash
cd frontend
npm install
npm run web
```

Runs on `http://localhost:19006`

## 📦 Building for Production

### Build Backend

```bash
cd backend
npm run build
npm run start:prod
```

### Build Frontend for Web

```bash
cd frontend
npm run web:build
```

Output: `frontend/dist/`

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deploy Options

- **Frontend**: GitHub Pages (free, automatic)
- **Backend**: Vercel, Railway, or your preferred Node.js host

## 🔧 Configuration

### Backend Environment Variables (`.env`)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### Frontend Environment Variables (`.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:3000/api`

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🐛 Troubleshooting

### CORS Issues
Add your frontend URL to `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: 'https://your-domain.com',
  credentials: true,
});
```

### Database Connection Failed
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Check database exists and user has permissions

### Frontend Can't Reach Backend
- Check backend is running
- Verify `EXPO_PUBLIC_API_URL` in frontend `.env`
- Check network tab in browser DevTools

## 📋 Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run start` | Start production server |
| `npm run start:dev` | Start with hot-reload |
| `npm run build` | Build for production |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |

### Frontend

| Command | Description |
|---------|-------------|
| `npm start` | Start dev server |
| `npm run web` | Run on web |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web:build` | Build for deployment |

## 🔐 Security

- **Passwords**: Hashed with bcryptjs
- **Authentication**: JWT tokens
- **API**: Protected with Passport strategies
- **Secrets**: Store in environment variables, never commit `.env`

## 📄 License

This project is proprietary software developed for Tshwane.

## 📞 Support

For issues or questions:
1. Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review API documentation at `/api` endpoint
3. Check application logs

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Push to GitHub
4. Create a Pull Request

---

**Status**: ✅ Ready for deployment  
**Last Updated**: June 2026
