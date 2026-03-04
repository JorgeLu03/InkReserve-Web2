import { Cita } from './schema.js';

// ── Mapeo estado string ↔ número ────────────────────────────────────────────
const STATUS_TO_NUM = {
    pending:     0,
    confirmed:   1,
    in_progress: 2,
    completed:   3,
    cancelled:   4,
};

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
        res.status(500).json({ message: error.message });
    }
};

// ── POST /api/citas ──────────────────────────────────────────────────────────
export const Crear_Cita = async (req, res) => {
    try {
        const {
            clientName, clientInitials, clientColor,
            artistId, date, time, hours = 1,
            style, dimensions, total, tattooKey,
            status = 'pending', notes, refImages,
        } = req.body;

        if (!clientName || !date || !time) {
            return res.status(400).json({ message: 'clientName, date y time son obligatorios.' });
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

        res.status(201).json({ message: 'Cita creada.', cita: mapToFrontend(nueva) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── PUT /api/citas/:id ───────────────────────────────────────────────────────
export const Actualizar_Cita = async (req, res) => {
    try {
        const citaActual = await Cita.findById(req.params.id);
        if (!citaActual) return res.status(404).json({ message: 'Cita no encontrada.' });

        const {
            clientName, clientInitials, clientColor,
            artistId, date, time, hours,
            style, dimensions, total, tattooKey,
            status, notes, refImages, cancellationFee,
        } = req.body;

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

        res.status(200).json({ message: 'Cita actualizada.', cita: mapToFrontend(actualizada) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── DELETE /api/citas/:id ────────────────────────────────────────────────────
export const Eliminar_Cita = async (req, res) => {
    try {
        const eliminada = await Cita.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ message: 'Cita no encontrada.' });
        res.status(200).json({ message: 'Cita eliminada.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
