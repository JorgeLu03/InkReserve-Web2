import express from 'express';
import {
    Reporte_Ganancias,
    Reporte_Servicios,
    Reporte_Citas_Por_Mes,
    Reporte_Clientes_Frecuentes,
} from './reportesController.js';
import { Token_Verificar } from './authMiddleware.js';

const router = express.Router();

// Todos los reportes requieren sesión iniciada
router.get('/ganancias',           Token_Verificar, Reporte_Ganancias);
router.get('/servicios',           Token_Verificar, Reporte_Servicios);
router.get('/citas-por-mes',       Token_Verificar, Reporte_Citas_Por_Mes);
router.get('/clientes-frecuentes', Token_Verificar, Reporte_Clientes_Frecuentes);

export default router;
