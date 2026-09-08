import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/database.js';
import proformasRoutes from './routes/proformas.routes.js';
import clientsRoutes from './routes/clients.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import propertiesRoutes from './routes/properties.routes.js';
import configRoutes from './routes/config.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging simple
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Valle Pacora Cotizador Backend API',
    company: 'Roble Constructora del Peru SAC',
    timestamp: new Date().toISOString()
  });
});

// Auto-inicializar DB si no está inicializada (para entornos serverless como Vercel)
app.use(async (req, res, next) => {
  if (!db.initialized) {
    try {
      await db.init();
    } catch (err) {
      console.warn('[DB] Fallback en memoria:', err.message);
    }
  }
  next();
});

// Rutas de la API
app.use('/api/proformas', proformasRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/config', configRoutes);
app.use('/api/auth', authRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint ${req.originalUrl} no encontrado` });
});

// Exportar la instancia app para funciones serverless (Vercel) y pruebas
export { app };
export default app;

// Inicializar DB y levantar servidor en modo standalone (desarrollo o servidor dedicado)
async function startServer() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` 🌾 Valle Pacora Cotizador - Servidor Backend Activo`);
      console.log(` 🚀 URL Local: http://localhost:${PORT}`);
      console.log(` 📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(` 📦 Base de Datos: server/data/valle_pacora_db.json`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Error al iniciar el servidor backend:', err);
    process.exit(1);
  }
}

// Solo iniciar listener si no estamos en entorno Vercel serverless
if (!process.env.VERCEL) {
  startServer();
}
