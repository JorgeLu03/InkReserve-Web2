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

// Helper: normaliza payload frontend para mongo
function extraerCampos(body) {
    const {
        Nombre,
        Especialidades,
        Anos_De_Experiencia,
        Horario_Dias,
        Horario_Horas,
        Esta_Disponible,
        Iniciales,
        Color_Avatar,
        Foto_Base64,
        Curriculum,
        Fecha_Nacimiento,
        RFC,
        CURP,
        Especialidades_Array,
        Horario_Inicio,
        Horario_Fin,
        Horario_Dias_Array,
        Tarifa_Hora,
        Salario_Mensual,
        Portafolio,
        Esta_Fichado,
        Id_Frontend,
        Artist_Id_Numerico,
    } = body;

    return {
        Nombre: Nombre?.trim() ?? '',
        Especialidades: Especialidades ?? 'Ninguna',
        Anos_De_Experiencia: Anos_De_Experiencia ?? 0,
        Horario_Dias: Horario_Dias ?? 'Lunes a Viernes',
        Horario_Horas: Horario_Horas ?? '10am a 6pm',
        Esta_Disponible: Esta_Disponible ?? true,
        Iniciales: Iniciales ?? '',
        Color_Avatar: Color_Avatar ?? '#c084fc',
        Foto_Base64: Foto_Base64 ?? null,
        Curriculum: Curriculum ?? null,
        Fecha_Nacimiento: Fecha_Nacimiento ?? '',
        RFC: RFC ?? '',
        CURP: CURP ?? '',
        Especialidades_Array: Especialidades_Array ?? [],
        Horario_Inicio: Horario_Inicio ?? '10:00',
        Horario_Fin: Horario_Fin ?? '18:00',
        Horario_Dias_Array: Horario_Dias_Array ?? [],
        Tarifa_Hora: Tarifa_Hora ?? 0,
        Salario_Mensual: Salario_Mensual ?? 0,
        Portafolio: Portafolio ?? [],
        Esta_Fichado: Esta_Fichado ?? false,
        Id_Frontend: Id_Frontend ?? '',
        Artist_Id_Numerico: Artist_Id_Numerico ?? 0,
    };
}

// POST /api/tatuadores — Crear un tatuador
export const Crear_Tatuador = async (req, res) => {
    try {
        if (!req.body.Nombre || req.body.Nombre.trim() === '') {
            return res.status(400).json({ message: 'El nombre del tatuador es obligatorio.' });
        }

        const nuevo = await Tatuador.create(extraerCampos(req.body));
        res.status(201).json({ message: 'Tatuador creado.', tatuador: nuevo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/tatuadores/:id — Actualizar un tatuador
export const Actualizar_Tatuador = async (req, res) => {
    try {
        const body = req.body;

        if (body.Nombre !== undefined && body.Nombre.trim() === '') {
            return res.status(400).json({ message: 'El nombre no puede estar vacio.' });
        }

        const CAMPOS = [
            'Nombre',
            'Especialidades',
            'Anos_De_Experiencia',
            'Horario_Dias',
            'Horario_Horas',
            'Esta_Disponible',
            'Iniciales',
            'Color_Avatar',
            'Foto_Base64',
            'Curriculum',
            'Fecha_Nacimiento',
            'RFC',
            'CURP',
            'Especialidades_Array',
            'Horario_Inicio',
            'Horario_Fin',
            'Horario_Dias_Array',
            'Tarifa_Hora',
            'Salario_Mensual',
            'Portafolio',
            'Esta_Fichado',
            'Id_Frontend',
            'Artist_Id_Numerico',
        ];

        const cambios = {};
        for (const campo of CAMPOS) {
            if (body[campo] !== undefined) {
                cambios[campo] = campo === 'Nombre' ? body[campo].trim() : body[campo];
            }
        }

        const actualizado = await Tatuador.findByIdAndUpdate(req.params.id, cambios, {
            new: true,
            runValidators: true,
        });

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
