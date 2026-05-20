import express from 'express';
import {
    Obtener_Clientes,
    Obtener_Cliente,
    Crear_Cliente,
    Actualizar_Cliente,
    Eliminar_Cliente,
} from './clientesController.js';
import { Token_Verificar } from './authMiddleware.js';

const router = express.Router();

// Todas las rutas de clientes requieren sesión iniciada
router.get('/',      Token_Verificar, Obtener_Clientes);
router.get('/:id',   Token_Verificar, Obtener_Cliente);
router.post('/',     Token_Verificar, Crear_Cliente);
router.put('/:id',   Token_Verificar, Actualizar_Cliente);
router.delete('/:id',Token_Verificar, Eliminar_Cliente);

export default router;
