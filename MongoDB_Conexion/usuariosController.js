// Controller de Usuarios — gestión administrativa.
// Solo el admin puede consultar y modificar usuarios.
// NO expone la contraseña en ninguna respuesta.
// NO permite cambiar Correo_Electronico ni Contrasena desde aquí
// (esos flujos requieren validaciones especiales y van por /api/auth).

import { Usuario } from './schema.js';
import { logger } from './logger.js';

// ── Validadores independientes de backend ────────────────────────────────────
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const TELEFONO_REGEX  = /^\d{10}$/;

// Campos del documento que SÍ se exponen al frontend
const PROYECCION_SEGURA = '-Contrasena';

// GET /api/usuarios — Listar todos los usuarios (sin contraseñas)
export const Obtener_Usuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, PROYECCION_SEGURA).sort({ Nombre_Completo: 1 });
        res.status(200).json(usuarios);
    } catch (error) {
        logger.error('Excepción en Obtener_Usuarios', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/usuarios/:id — Obtener un usuario por ID (sin contraseña)
export const Obtener_Usuario = async (req, res) => {
    try {
        if (!OBJECT_ID_REGEX.test(req.params.id || '')) {
            return res.status(400).json({ message: 'ID de usuario inválido.' });
        }
        const usuario = await Usuario.findById(req.params.id, PROYECCION_SEGURA);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        logger.error('Excepción en Obtener_Usuario', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/usuarios/:id — Actualizar datos de gestión administrativa
// Campos permitidos: Nombre_Completo, Telefono, Es_Admin, Esta_Activo
// NO se puede cambiar Correo_Electronico ni Contrasena por esta vía.
export const Actualizar_Usuario = async (req, res) => {
    const userIdParam = req.params.id;
    logger.info('Inicio: Actualizar_Usuario', { adminId: req.user?.id, targetId: userIdParam });

    try {
        // Validación del ID
        if (!OBJECT_ID_REGEX.test(userIdParam || '')) {
            return res.status(400).json({ message: 'ID de usuario inválido.' });
        }

        const { Nombre_Completo, Telefono, Es_Admin, Esta_Activo } = req.body;

        // ── Validaciones independientes de backend ─────────────────────────
        if (Nombre_Completo !== undefined) {
            if (typeof Nombre_Completo !== 'string' || Nombre_Completo.trim().length < 5) {
                return res.status(400).json({ message: 'Nombre_Completo debe tener al menos 5 caracteres.' });
            }
            if (Nombre_Completo.trim().length > 100) {
                return res.status(400).json({ message: 'Nombre_Completo no puede exceder 100 caracteres.' });
            }
        }
        if (Telefono !== undefined && Telefono !== '' && Telefono !== null) {
            if (!TELEFONO_REGEX.test(String(Telefono))) {
                return res.status(400).json({ message: 'Telefono debe tener exactamente 10 dígitos.' });
            }
        }
        if (Es_Admin !== undefined && typeof Es_Admin !== 'boolean') {
            return res.status(400).json({ message: 'Es_Admin debe ser booleano.' });
        }
        if (Esta_Activo !== undefined && typeof Esta_Activo !== 'boolean') {
            return res.status(400).json({ message: 'Esta_Activo debe ser booleano.' });
        }

        // Regla de negocio: un admin no puede quitarse su propio rol ni desactivarse
        const esSiMismo = String(req.user?.id) === String(userIdParam);
        if (esSiMismo && Es_Admin === false) {
            return res.status(400).json({ message: 'Un administrador no puede quitarse a sí mismo el rol.' });
        }
        if (esSiMismo && Esta_Activo === false) {
            return res.status(400).json({ message: 'Un administrador no puede desactivar su propia cuenta.' });
        }

        // Armar objeto de cambios solo con campos permitidos
        const cambios = { Ultima_Actualizacion: new Date() };
        if (Nombre_Completo !== undefined) cambios.Nombre_Completo = Nombre_Completo.trim();
        if (Telefono        !== undefined) cambios.Telefono        = Telefono;
        if (Es_Admin        !== undefined) cambios.Es_Admin        = Es_Admin;
        if (Esta_Activo     !== undefined) cambios.Esta_Activo     = Esta_Activo;

        const actualizado = await Usuario.findByIdAndUpdate(
            userIdParam,
            cambios,
            { new: true, runValidators: true, projection: PROYECCION_SEGURA }
        );

        if (!actualizado) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        logger.info('Fin: Actualizar_Usuario OK', { targetId: actualizado._id.toString() });
        res.status(200).json({ message: 'Usuario actualizado.', usuario: actualizado });
    } catch (error) {
        logger.error('Excepción en Actualizar_Usuario', error);
        res.status(500).json({ message: error.message });
    }
};
