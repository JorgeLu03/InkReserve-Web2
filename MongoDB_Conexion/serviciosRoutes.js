import express from 'express';
import {
    Obtener_Servicios,
    Obtener_Servicio,
    Crear_Servicio,
    Actualizar_Servicio,
    Eliminar_Servicio,
} from './serviciosController.js';
import { Token_Verificar } from './authMiddleware.js';

const router = express.Router();

// Rutas públicas (solo lectura)
router.get('/',     Obtener_Servicios);
router.get('/:id',  Obtener_Servicio);

// Rutas protegidas (requieren token de admin)
router.post('/',        Token_Verificar, Crear_Servicio);
router.put('/:id',      Token_Verificar, Actualizar_Servicio);
router.delete('/:id',   Token_Verificar, Eliminar_Servicio);

export default router;
