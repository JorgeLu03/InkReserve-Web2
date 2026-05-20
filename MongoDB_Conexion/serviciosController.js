import { Categoria } from './schema.js';
import { logger } from './logger.js';

// GET /api/servicios — Obtener todos los servicios
export const Obtener_Servicios = async (req, res) => {
    try {
        const servicios = await Categoria.find().sort({ Titulo: 1 });
        res.status(200).json(servicios);
    } catch (error) {
        logger.error('Excepción en controller de Servicios', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/servicios/:id — Obtener un servicio por ID
export const Obtener_Servicio = async (req, res) => {
    try {
        const servicio = await Categoria.findById(req.params.id);
        if (!servicio) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }
        res.status(200).json(servicio);
    } catch (error) {
        logger.error('Excepción en controller de Servicios', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/servicios — Crear un servicio
export const Crear_Servicio = async (req, res) => {
    try {
        const { Titulo } = req.body;

        // Validaciones independientes de backend
        if (!Titulo || typeof Titulo !== 'string' || Titulo.trim().length < 2) {
            return res.status(400).json({ message: 'El título debe tener al menos 2 caracteres.' });
        }
        if (Titulo.trim().length > 80) {
            return res.status(400).json({ message: 'El título no puede exceder 80 caracteres.' });
        }

        const Existe = await Categoria.findOne({ Titulo: Titulo.trim() });
        if (Existe) {
            return res.status(400).json({ message: 'Ya existe un servicio con ese título.' });
        }

        const nuevo = await Categoria.create({ Titulo: Titulo.trim() });
        res.status(201).json({ message: 'Servicio creado.', servicio: nuevo });
    } catch (error) {
        logger.error('Excepción en controller de Servicios', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/servicios/:id — Actualizar un servicio
export const Actualizar_Servicio = async (req, res) => {
    try {
        const { Titulo } = req.body;

        // Validaciones independientes de backend
        if (!Titulo || typeof Titulo !== 'string' || Titulo.trim().length < 2) {
            return res.status(400).json({ message: 'El título debe tener al menos 2 caracteres.' });
        }
        if (Titulo.trim().length > 80) {
            return res.status(400).json({ message: 'El título no puede exceder 80 caracteres.' });
        }

        const actualizado = await Categoria.findByIdAndUpdate(
            req.params.id,
            { Titulo: Titulo.trim() },
            { new: true, runValidators: true }
        );

        if (!actualizado) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        res.status(200).json({ message: 'Servicio actualizado.', servicio: actualizado });
    } catch (error) {
        logger.error('Excepción en controller de Servicios', error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/servicios/:id — Eliminar un servicio
export const Eliminar_Servicio = async (req, res) => {
    try {
        const eliminado = await Categoria.findByIdAndDelete(req.params.id);

        if (!eliminado) {
            return res.status(404).json({ message: 'Servicio no encontrado.' });
        }

        res.status(200).json({ message: 'Servicio eliminado.' });
    } catch (error) {
        logger.error('Excepción en controller de Servicios', error);
        res.status(500).json({ message: error.message });
    }
};
