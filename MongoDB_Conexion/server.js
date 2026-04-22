import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes      from './authRoutes.js';
import serviciosRoutes from './serviciosRoutes.js';
import tatuadoresRoutes from './tatuadoresRoutes.js';
import citasRoutes     from './citasRoutes.js';
import clientesRoutes  from './clientesRoutes.js';
import ventasRoutes    from './ventasRoutes.js';
import reportesRoutes  from './reportesRoutes.js';

const app = express();

// MIDDLEWARE
app.use(cors({
    origin: /^http:\/\/localhost:\d+$/,
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

// DATABASE CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Ink_Reserve';
const PORT      = process.env.PORT      || 3000;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Conexion con MongoDB exitosa');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => console.error('Connection error', err));