import express from 'express';
import {
    Obtener_Servicios,
    Obtener_Servicio,
    Crear_Servicio,
    Actualizar_Servicio,
    Eliminar_Servicio,
} from './serviciosController.js';
import { Token_Verificar, Admin_Only } from './authMiddleware.js';

const router = express.Router();

// Lectura: cualquier usuario autenticado puede ver las categorías
// (las necesita para crear citas y tatuadores).
router.get('/',     Token_Verificar, Obtener_Servicios);
router.get('/:id',  Token_Verificar, Obtener_Servicio);

// Escritura: solo administradores pueden crear, editar o eliminar.
router.post('/',     Token_Verificar, Admin_Only, Crear_Servicio);
router.put('/:id',   Token_Verificar, Admin_Only, Actualizar_Servicio);
router.delete('/:id', Token_Verificar, Admin_Only, Eliminar_Servicio);

export default router;
