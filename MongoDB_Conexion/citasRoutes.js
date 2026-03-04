import express from 'express';
import {
    Obtener_Citas,
    Obtener_Cita,
    Obtener_Citas_Por_Tatuador,
    Crear_Cita,
    Actualizar_Cita,
    Eliminar_Cita,
} from './citasController.js';
import { Token_Verificar } from './authMiddleware.js';

const router = express.Router();

// Todas las rutas de citas requieren sesión iniciada
router.get('/',                          Token_Verificar, Obtener_Citas);
router.get('/tatuador/:tatuadorId',      Token_Verificar, Obtener_Citas_Por_Tatuador);
router.get('/:id',                       Token_Verificar, Obtener_Cita);
router.post('/',                         Token_Verificar, Crear_Cita);
router.put('/:id',                       Token_Verificar, Actualizar_Cita);
router.delete('/:id',                    Token_Verificar, Eliminar_Cita);

export default router;
