import express from 'express';
import {
    Obtener_Tatuadores,
    Obtener_Tatuadores_Disponibles,
    Obtener_Tatuador,
    Crear_Tatuador,
    Actualizar_Tatuador,
    Eliminar_Tatuador,
} from './tatuadoresController.js';
import { Token_Verificar } from './authMiddleware.js';

const router = express.Router();

// Rutas públicas (solo lectura)
router.get('/',             Obtener_Tatuadores);
router.get('/disponibles',  Obtener_Tatuadores_Disponibles);
router.get('/:id',          Obtener_Tatuador);

// Rutas protegidas (requieren token)
router.post('/',        Token_Verificar, Crear_Tatuador);
router.put('/:id',      Token_Verificar, Actualizar_Tatuador);
router.delete('/:id',   Token_Verificar, Eliminar_Tatuador);

export default router;
