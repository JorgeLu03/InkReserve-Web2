import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { logger } from './logger.js';
import authRoutes      from './authRoutes.js';
import serviciosRoutes from './serviciosRoutes.js';
import tatuadoresRoutes from './tatuadoresRoutes.js';
import citasRoutes     from './citasRoutes.js';
import clientesRoutes  from './clientesRoutes.js';
import ventasRoutes    from './ventasRoutes.js';
import reportesRoutes  from './reportesRoutes.js';
import usuariosRoutes  from './usuariosRoutes.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

// MIDDLEWARE
app.use(cors({
    origin(origin, callback) {
        // Allow non-browser clients (Postman/curl) and same-origin requests without Origin header.
        if (!origin) return callback(null, true);

        const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
        const isAllowed = allowedOrigins.includes(origin);
        if (isLocalhost || isAllowed) return callback(null, true);

        return callback(new Error('CORS: origin no permitido'));
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ROUTES
app.use('/api/auth',       authRoutes);
app.use('/api/servicios',  serviciosRoutes);
app.use('/api/tatuadores', tatuadoresRoutes);
app.use('/api/citas',      citasRoutes);
app.use('/api/clientes',   clientesRoutes);
app.use('/api/ventas',     ventasRoutes);
app.use('/api/reportes',   reportesRoutes);
app.use('/api/usuarios',   usuariosRoutes);

// DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Ink_Reserve';
const PORT      = process.env.PORT      || 3000;

logger.info('Iniciando proceso de arranque del backend');

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Conexion con MongoDB exitosa');
        logger.info('Conexión a MongoDB establecida', { uri: MONGO_URI });
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            logger.info(`Server escuchando en puerto ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Connection error', err);
        logger.error('Fallo al conectar con MongoDB', err);
    });

// Captura excepciones no controladas y rechazos sin handler
process.on('uncaughtException', (err) => {
    logger.error('uncaughtException', err);
});
process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection', reason);
});