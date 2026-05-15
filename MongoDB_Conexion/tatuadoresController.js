import { Tatuador } from './schema.js';
import { logger } from './logger.js';

// ── Validadores independientes de backend ────────────────────────────────────
// RFC mexicano: 4 letras + 6 dígitos + 3 alfanuméricos (PF) o 3 letras + 6 dígitos + 3 alfanuméricos (PM)
const RFC_REGEX  = /^([A-ZÑ&]{3,4})\d{6}[A-Z0-9]{3}$/i;
// CURP mexicano: 18 caracteres con patrón específico
const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/i;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validarPayloadTatuador(body, esCreacion) {
    const { Nombre, RFC, CURP, Horario_Inicio, Horario_Fin, Horario_Dias_Array, Tarifa_Hora, Salario_Mensual, Anos_De_Experiencia } = body;

    if (esCreacion) {
        if (!Nombre || Nombre.trim().length < 2) {
            return 'Nombre es obligatorio (mínimo 2 caracteres).';
        }
    } else if (Nombre !== undefined && Nombre.trim().length < 2) {
        return 'Nombre debe tener al menos 2 caracteres.';
    }
    if (Nombre !== undefined && Nombre.trim().length > 100) {
        return 'Nombre no puede exceder 100 caracteres.';
    }
    if (RFC && !RFC_REGEX.test(RFC.trim())) {
        return 'RFC con formato inválido.';
    }
    if (CURP && !CURP_REGEX.test(CURP.trim())) {
        return 'CURP con formato inválido.';
    }
    if (Horario_Inicio && !HORA_REGEX.test(Horario_Inicio)) {
        return 'Horario_Inicio inválido (usa HH:MM).';
    }
    if (Horario_Fin && !HORA_REGEX.test(Horario_Fin)) {
        return 'Horario_Fin inválido (usa HH:MM).';
    }
    if (Horario_Inicio && Horario_Fin && Horario_Inicio >= Horario_Fin) {
        return 'Horario_Inicio debe ser menor que Horario_Fin.';
    }
    // Días: solo validamos formato básico (string no vacío) y longitud razonable.
    // No restringimos a un set fijo porque el frontend usa abreviaciones
    // ("Lun", "Mar", "Mié", etc.) que son una convención de UI, no de dato.
    if (Array.isArray(Horario_Dias_Array)) {
        for (const d of Horario_Dias_Array) {
            const s = String(d ?? '').trim();
            if (!s || s.length > 15) {
                return `Día inválido: "${d}".`;
            }
        }
    }
    if (Tarifa_Hora !== undefined) {
        const v = Number(Tarifa_Hora);
        if (!Number.isFinite(v) || v < 0) return 'Tarifa_Hora debe ser un número >= 0.';
    }
    if (Salario_Mensual !== undefined) {
        const v = Number(Salario_Mensual);
        if (!Number.isFinite(v) || v < 0) return 'Salario_Mensual debe ser un número >= 0.';
    }
    if (Anos_De_Experiencia !== undefined) {
        const v = Number(Anos_De_Experiencia);
        if (!Number.isInteger(v) || v < 0 || v > 80) return 'Anos_De_Experiencia debe ser entero entre 0 y 80.';
    }
    return null;
}

// GET /api/tatuadores — Obtener todos los tatuadores
export const Obtener_Tatuadores = async (req, res) => {
    try {
        const tatuadores = await Tatuador.find().sort({ Nombre: 1 });
        res.status(200).json(tatuadores);
    } catch (error) {
        logger.error('Excepción en controller de Tatuadores', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/tatuadores/disponibles — Solo los disponibles
export const Obtener_Tatuadores_Disponibles = async (req, res) => {
    try {
        const tatuadores = await Tatuador.find({ Esta_Disponible: true }).sort({ Nombre: 1 });
        res.status(200).json(tatuadores);
    } catch (error) {
        logger.error('Excepción en controller de Tatuadores', error);
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
        logger.error('Excepción en controller de Tatuadores', error);
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
        // Validaciones independientes de backend
        const errorValidacion = validarPayloadTatuador(req.body, true);
        if (errorValidacion) {
            return res.status(400).json({ message: errorValidacion });
        }

        const nuevo = await Tatuador.create(extraerCampos(req.body));
        res.status(201).json({ message: 'Tatuador creado.', tatuador: nuevo });
    } catch (error) {
        logger.error('Excepción en controller de Tatuadores', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/tatuadores/:id — Actualizar un tatuador
export const Actualizar_Tatuador = async (req, res) => {
    try {
        const body = req.body;

        // Validaciones independientes de backend (modo update)
        const errorValidacion = validarPayloadTatuador(body, false);
        if (errorValidacion) {
            return res.status(400).json({ message: errorValidacion });
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
        logger.error('Excepción en controller de Tatuadores', error);
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
        logger.error('Excepción en controller de Tatuadores', error);
        res.status(500).json({ message: error.message });
    }
};
