import express from 'express';
import {
    Obtener_Usuarios,
    Obtener_Usuario,
    Actualizar_Usuario,
} from './usuariosController.js';
import { Token_Verificar, Admin_Only } from './authMiddleware.js';

const router = express.Router();

// Todas las rutas de gestión de usuarios requieren:
//   1) Sesión iniciada con token válido (Token_Verificar)
//   2) El usuario autenticado debe ser admin (Admin_Only)
//
// NOTA: el endpoint de creación de usuarios es POST /api/auth/register
// (es público porque la rúbrica permite el registro fuera del login).
// NO se expone DELETE para preservar integridad referencial: las bajas
// se manejan con el campo Esta_Activo vía PUT (soft-delete).
router.get('/',     Token_Verificar, Admin_Only, Obtener_Usuarios);
router.get('/:id',  Token_Verificar, Admin_Only, Obtener_Usuario);
router.put('/:id',  Token_Verificar, Admin_Only, Actualizar_Usuario);

export default router;
