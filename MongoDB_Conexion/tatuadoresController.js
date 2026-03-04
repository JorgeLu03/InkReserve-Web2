import { Tatuador } from './schema.js';

// GET /api/tatuadores — Obtener todos los tatuadores
export const Obtener_Tatuadores = async (req, res) => {
    try {
        const tatuadores = await Tatuador.find().sort({ Nombre: 1 });
        res.status(200).json(tatuadores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tatuadores/disponibles — Solo los disponibles
export const Obtener_Tatuadores_Disponibles = async (req, res) => {
    try {
        const tatuadores = await Tatuador.find({ Esta_Disponible: true }).sort({ Nombre: 1 });
        res.status(200).json(tatuadores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tatuadores/:id — Obtener un tatuador por ID
export const Obtener_Tatuador = async (req, res) => {
    try {
        const tatuador = await Tatuador.findById(req.params.id);
        if (!tatuador) {
            return res.status(404).json({ message: 'Tatuador no encontrado.' });
        }
        res.status(200).json(tatuador);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/tatuadores — Crear un tatuador
export const Crear_Tatuador = async (req, res) => {
    try {
        const {
            Nombre,
            Especialidades,
            Anos_De_Experiencia,
            Horario_Dias,
            Horario_Horas,
            Esta_Disponible,
        } = req.body;

        if (!Nombre || Nombre.trim() === '') {
            return res.status(400).json({ message: 'El nombre del tatuador es obligatorio.' });
        }

        const nuevo = await Tatuador.create({
            Nombre:               Nombre.trim(),
            Especialidades:       Especialidades       ?? 'Ninguna',
            Anos_De_Experiencia:  Anos_De_Experiencia  ?? 0,
            Horario_Dias:         Horario_Dias         ?? 'Lunes a Viernes',
            Horario_Horas:        Horario_Horas        ?? '10am a 6pm',
            Esta_Disponible:      Esta_Disponible      ?? true,
        });

        res.status(201).json({ message: 'Tatuador creado.', tatuador: nuevo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/tatuadores/:id — Actualizar un tatuador
export const Actualizar_Tatuador = async (req, res) => {
    try {
        const {
            Nombre,
            Especialidades,
            Anos_De_Experiencia,
            Horario_Dias,
            Horario_Horas,
            Esta_Disponible,
        } = req.body;

        if (Nombre !== undefined && Nombre.trim() === '') {
            return res.status(400).json({ message: 'El nombre no puede estar vacío.' });
        }

        const cambios = {};
        if (Nombre              !== undefined) cambios.Nombre              = Nombre.trim();
        if (Especialidades      !== undefined) cambios.Especialidades      = Especialidades;
        if (Anos_De_Experiencia !== undefined) cambios.Anos_De_Experiencia = Anos_De_Experiencia;
        if (Horario_Dias        !== undefined) cambios.Horario_Dias        = Horario_Dias;
        if (Horario_Horas       !== undefined) cambios.Horario_Horas       = Horario_Horas;
        if (Esta_Disponible     !== undefined) cambios.Esta_Disponible     = Esta_Disponible;

        const actualizado = await Tatuador.findByIdAndUpdate(
            req.params.id,
            cambios,
            { new: true, runValidators: true }
        );

        if (!actualizado) {
            return res.status(404).json({ message: 'Tatuador no encontrado.' });
        }

        res.status(200).json({ message: 'Tatuador actualizado.', tatuador: actualizado });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/tatuadores/:id — Eliminar un tatuador
export const Eliminar_Tatuador = async (req, res) => {
    try {
        const eliminado = await Tatuador.findByIdAndDelete(req.params.id);

        if (!eliminado) {
            return res.status(404).json({ message: 'Tatuador no encontrado.' });
        }

        res.status(200).json({ message: 'Tatuador eliminado.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
