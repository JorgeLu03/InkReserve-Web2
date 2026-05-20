import { Cita, Cliente } from './schema.js';
import { logger } from './logger.js';

// ── Mapeo estado string ↔ número ────────────────────────────────────────────
const STATUS_TO_NUM = {
    pending:     0,
    confirmed:   1,
    in_progress: 2,
    completed:   3,
    cancelled:   4,
};
const STATUS_VALIDOS = Object.keys(STATUS_TO_NUM);

// ── Validadores independientes de backend ────────────────────────────────────
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;        // YYYY-MM-DD
const HORA_REGEX  = /^([01]\d|2[0-3]):[0-5]\d$/;  // HH:MM 00-23 : 00-59

function validarPayloadCita({ clientName, date, time, hours, total, status, artistId }, esCreacion) {
    if (esCreacion) {
        if (!clientName || String(clientName).trim().length < 2) {
            return 'clientName es obligatorio y debe tener al menos 2 caracteres.';
        }
        if (!date) return 'date es obligatorio.';
        if (!time) return 'time es obligatorio.';
    }
    if (date !== undefined && !FECHA_REGEX.test(String(date))) {
        return 'Formato de date inválido. Usa YYYY-MM-DD.';
    }
    if (time !== undefined && !HORA_REGEX.test(String(time))) {
        return 'Formato de time inválido. Usa HH:MM (24h).';
    }
    if (hours !== undefined) {
        const h = Number(hours);
        if (!Number.isFinite(h) || h < 1 || h > 12) {
            return 'hours debe ser un número entre 1 y 12.';
        }
    }
    if (total !== undefined) {
        const t = Number(total);
        if (!Number.isFinite(t) || t < 0) {
            return 'total debe ser un número mayor o igual a 0.';
        }
    }
    if (artistId !== undefined && artistId !== null && artistId !== '') {
        // Acepta número (mock data) o string (ObjectId/identificador del artista).
        // Solo rechazamos casos claramente inválidos.
        const esNumeroOk = typeof artistId === 'number' && Number.isFinite(artistId) && artistId >= 0;
        const esStringOk = typeof artistId === 'string' && artistId.trim().length > 0;
        if (!esNumeroOk && !esStringOk) {
            return 'artistId inválido.';
        }
    }
    if (status !== undefined && !STATUS_VALIDOS.includes(status)) {
        return `status inválido. Permitidos: ${STATUS_VALIDOS.join(', ')}.`;
    }
    return null;
}

// ── Convierte documento DB → objeto que espera el frontend ──────────────────
function mapToFrontend(c) {
    return {
        id:             c._id,
        clientName:     c.clientName     || '',
        clientInitials: c.clientInitials || '',
        clientColor:    c.clientColor    || '#c084fc',
        artistId:       c.artistId       ?? 1,
        date:           c.date           || '',
        time:           c.time           || '',
        hours:          c.hours          || 1,
        style:          c.style          || '',
        dimensions:     c.dimensions     || '—',
        total:          c.total_precio   || 0,
        tattooKey:      c.tattooKey      || 'rose',
        status:         c.status         || 'pending',
        cancellationFee: c.cancellationFee || 0,
        notes:          c.Nota_Del_Cliente || '',
        refImages:      c.refImages      || [],
    };
}

// ── Traslape: mismo artistId, misma fecha, horas solapadas ──────────────────
async function hayTraslape(artistId, date, time, hours, excluirId = null) {
    if (!artistId || !date || !time) return null;

    const [startH, startM] = time.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin   = startMin + (hours || 1) * 60;

    const candidatos = await Cita.find({
        artistId,
        date,
        status: { $nin: ['cancelled'] },
        ...(excluirId ? { _id: { $ne: excluirId } } : {}),
    });

    for (const c of candidatos) {
        const [cH, cM] = (c.time || '00:00').split(':').map(Number);
        const cStart = cH * 60 + cM;
        const cEnd   = cStart + (c.hours || 1) * 60;
        if (startMin < cEnd && endMin > cStart) return c;
    }
    return null;
}

// ── GET /api/citas ───────────────────────────────────────────────────────────
export const Obtener_Citas = async (req, res) => {
    try {
        const citas = await Cita.find().sort({ date: 1, time: 1 });
        res.status(200).json(citas.map(mapToFrontend));
    } catch (error) {
        logger.error('Excepción en Obtener_Citas', error);
        res.status(500).json({ message: error.message });
    }
};

// ── GET /api/citas/:id ───────────────────────────────────────────────────────
export const Obtener_Cita = async (req, res) => {
    try {
        const cita = await Cita.findById(req.params.id);
        if (!cita) return res.status(404).json({ message: 'Cita no encontrada.' });
        res.status(200).json(mapToFrontend(cita));
    } catch (error) {
        logger.error('Excepción en Obtener_Cita', error);
        res.status(500).json({ message: error.message });
    }
};

// ── GET /api/citas/artista/:tatuadorId ──────────────────────────────────────
export const Obtener_Citas_Por_Tatuador = async (req, res) => {
    try {
        const citas = await Cita.find({ artistId: Number(req.params.tatuadorId) })
            .sort({ date: 1, time: 1 });
        res.status(200).json(citas.map(mapToFrontend));
    } catch (error) {
        logger.error('Excepción en Obtener_Citas_Por_Tatuador', error);
        res.status(500).json({ message: error.message });
    }
};

// ── POST /api/citas ──────────────────────────────────────────────────────────
export const Crear_Cita = async (req, res) => {
    logger.info('Inicio: Crear_Cita', { cliente: req.body?.clientName, fecha: req.body?.date, hora: req.body?.time });
    try {
        const {
            clientName, clientInitials, clientColor,
            artistId, date, time, hours = 1,
            style, dimensions, total, tattooKey,
            status = 'pending', notes, refImages,
        } = req.body;

        // Validación independiente de backend
        const errorValidacion = validarPayloadCita(
            { clientName, date, time, hours, total, status, artistId },
            true,
        );
        if (errorValidacion) {
            return res.status(400).json({ message: errorValidacion });
        }

        const conflicto = await hayTraslape(artistId, date, time, hours);
        if (conflicto) {
            return res.status(409).json({
                message: `Traslape: el artista ya tiene cita el ${conflicto.date} a las ${conflicto.time} (${conflicto.hours}h).`,
                conflicto_id: conflicto._id,
            });
        }

        const nueva = await Cita.create({
            clientName, clientInitials, clientColor,
            artistId, date, time, hours,
            style, dimensions,
            total_precio:     total || 0,
            tattooKey,
            status,
            Estado_Cita:      STATUS_TO_NUM[status] ?? 0,
            Nota_Del_Cliente: notes || '',
            refImages:        refImages || [],
            Fecha_y_Hora:     new Date(`${date}T${time}:00`),
            Duracion_Estimada: (hours || 1) * 60,
        });

        // Registrar o actualizar cliente en la colección de clientes
        try {
            const nombreCliente = (clientName || '').trim();
            let clienteDoc = await Cliente.findOne({ Nombre: nombreCliente });
            if (!clienteDoc) {
                await Cliente.create({
                    Nombre: nombreCliente,
                    Citas_Anteriores: [nueva._id],
                    Total_Gastado: total || 0,
                    Notas_Importantes: '',
                    Preferencias: '',
                });
            } else {
                clienteDoc.Citas_Anteriores.push(nueva._id);
                clienteDoc.Total_Gastado = (clienteDoc.Total_Gastado || 0) + (total || 0);
                await clienteDoc.save();
            }
        } catch (clienteErr) {
            logger.warn('No se pudo registrar cliente', clienteErr?.message);
        }

        logger.info('Fin: Crear_Cita OK', { citaId: nueva._id.toString() });
        res.status(201).json({ message: 'Cita creada.', cita: mapToFrontend(nueva) });
    } catch (error) {
        logger.error('Excepción en Crear_Cita', error);
        res.status(500).json({ message: error.message });
    }
};

// ── PUT /api/citas/:id ───────────────────────────────────────────────────────
export const Actualizar_Cita = async (req, res) => {
    logger.info('Inicio: Actualizar_Cita', { citaId: req.params.id });
    try {
        const citaActual = await Cita.findById(req.params.id);
        if (!citaActual) return res.status(404).json({ message: 'Cita no encontrada.' });

        const {
            clientName, clientInitials, clientColor,
            artistId, date, time, hours,
            style, dimensions, total, tattooKey,
            status, notes, refImages, cancellationFee,
        } = req.body;

        // Validación independiente de backend (modo update — campos opcionales)
        const errorValidacion = validarPayloadCita(
            { clientName, date, time, hours, total, status, artistId },
            false,
        );
        if (errorValidacion) {
            return res.status(400).json({ message: errorValidacion });
        }
        if (cancellationFee !== undefined) {
            const cf = Number(cancellationFee);
            if (!Number.isFinite(cf) || cf < 0) {
                return res.status(400).json({ message: 'cancellationFee debe ser un número mayor o igual a 0.' });
            }
        }

        const cambiaHorario = artistId !== undefined || date !== undefined
                           || time     !== undefined || hours !== undefined;
        if (cambiaHorario) {
            const aId  = artistId !== undefined ? artistId  : citaActual.artistId;
            const aDate= date     !== undefined ? date      : citaActual.date;
            const aTime= time     !== undefined ? time      : citaActual.time;
            const aHrs = hours    !== undefined ? hours     : citaActual.hours;
            const conflicto = await hayTraslape(aId, aDate, aTime, aHrs, req.params.id);
            if (conflicto) {
                return res.status(409).json({
                    message: `Traslape: el artista ya tiene cita el ${conflicto.date} a las ${conflicto.time}.`,
                    conflicto_id: conflicto._id,
                });
            }
        }

        const cambios = { Fecha_ultima_Modificacion: new Date() };
        if (clientName      !== undefined) cambios.clientName       = clientName;
        if (clientInitials  !== undefined) cambios.clientInitials   = clientInitials;
        if (clientColor     !== undefined) cambios.clientColor      = clientColor;
        if (artistId        !== undefined) cambios.artistId         = artistId;
        if (date            !== undefined) cambios.date             = date;
        if (time            !== undefined) cambios.time             = time;
        if (hours           !== undefined) { cambios.hours = hours; cambios.Duracion_Estimada = hours * 60; }
        if (style           !== undefined) cambios.style            = style;
        if (dimensions      !== undefined) cambios.dimensions       = dimensions;
        if (total           !== undefined) cambios.total_precio     = total;
        if (tattooKey       !== undefined) cambios.tattooKey        = tattooKey;
        if (notes           !== undefined) cambios.Nota_Del_Cliente = notes;
        if (refImages       !== undefined) cambios.refImages        = refImages;
        if (cancellationFee !== undefined) cambios.cancellationFee  = cancellationFee;
        if (status          !== undefined) {
            cambios.status      = status;
            cambios.Estado_Cita = STATUS_TO_NUM[status] ?? citaActual.Estado_Cita;
        }
        if (date !== undefined && time !== undefined) {
            cambios.Fecha_y_Hora = new Date(`${date}T${time}:00`);
        }

        const actualizada = await Cita.findByIdAndUpdate(
            req.params.id, cambios, { new: true }
        );

        logger.info('Fin: Actualizar_Cita OK', { citaId: actualizada._id.toString() });
        res.status(200).json({ message: 'Cita actualizada.', cita: mapToFrontend(actualizada) });
    } catch (error) {
        logger.error('Excepción en Actualizar_Cita', error);
        res.status(500).json({ message: error.message });
    }
};

// ── DELETE /api/citas/:id ────────────────────────────────────────────────────
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export const Eliminar_Cita = async (req, res) => {
    logger.info('Inicio: Eliminar_Cita', { citaId: req.params.id });
    try {
        // Validación independiente: ObjectId debe ser de 24 hex chars
        if (!OBJECT_ID_REGEX.test(req.params.id || '')) {
            return res.status(400).json({ message: 'ID de cita inválido.' });
        }
        const eliminada = await Cita.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ message: 'Cita no encontrada.' });
        logger.info('Fin: Eliminar_Cita OK', { citaId: eliminada._id.toString() });
        res.status(200).json({ message: 'Cita eliminada.' });
    } catch (error) {
        logger.error('Excepción en Eliminar_Cita', error);
        res.status(500).json({ message: error.message });
    }
};
