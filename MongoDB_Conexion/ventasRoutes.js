import express from 'express';
import {
    Obtener_Ventas,
    Obtener_Venta,
    Crear_Venta,
    Actualizar_Venta,
    Eliminar_Venta,
} from './ventasController.js';
import { Token_Verificar } from './authMiddleware.js';

const router = express.Router();

// Todas las rutas de ventas requieren sesión iniciada
router.get('/',       Token_Verificar, Obtener_Ventas);
router.get('/:id',    Token_Verificar, Obtener_Venta);
router.post('/',      Token_Verificar, Crear_Venta);
router.put('/:id',    Token_Verificar, Actualizar_Venta);
router.delete('/:id', Token_Verificar, Eliminar_Venta);

export default router;
