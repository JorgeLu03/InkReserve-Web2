import { Venta } from './schema.js';
import { logger } from './logger.js';

// ── Validadores independientes de backend ────────────────────────────────────
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
const ESTADOS_PAGO_VALIDOS = [0, 1, 2]; // 0-Pagado, 1-Pendiente, 2-Reembolsado

function validarPayloadVenta(body, esCreacion) {
    const {
        Cita_Asociada, Cliente_Asociado, Tatuador_Asociado,
        Precio, Anticipo_Aplicado, Total_Pagado, Estado_Pago, Fecha_Pago,
    } = body;

    if (esCreacion) {
        if (!Cita_Asociada || !OBJECT_ID_REGEX.test(String(Cita_Asociada))) {
            return 'Cita_Asociada inválida o ausente.';
        }
        if (!Cliente_Asociado || !OBJECT_ID_REGEX.test(String(Cliente_Asociado))) {
            return 'Cliente_Asociado inválido o ausente.';
        }
        if (!Tatuador_Asociado || !OBJECT_ID_REGEX.test(String(Tatuador_Asociado))) {
            return 'Tatuador_Asociado inválido o ausente.';
        }
        if (Precio === undefined || Precio === null) return 'Precio es obligatorio.';
    }
    if (Precio !== undefined && Precio !== null) {
        const p = Number(Precio);
        if (!Number.isFinite(p) || p <= 0) return 'Precio debe ser un número mayor a 0.';
    }
    if (Anticipo_Aplicado !== undefined) {
        const a = Number(Anticipo_Aplicado);
        if (!Number.isFinite(a) || a < 0) return 'Anticipo_Aplicado debe ser un número >= 0.';
        if (Precio !== undefined && a > Number(Precio)) {
            return 'Anticipo_Aplicado no puede ser mayor que Precio.';
        }
    }
    if (Total_Pagado !== undefined) {
        const t = Number(Total_Pagado);
        if (!Number.isFinite(t) || t < 0) return 'Total_Pagado debe ser un número >= 0.';
    }
    if (Estado_Pago !== undefined) {
        const e = Number(Estado_Pago);
        if (!ESTADOS_PAGO_VALIDOS.includes(e)) {
            return `Estado_Pago inválido. Permitidos: 0 (Pagado), 1 (Pendiente), 2 (Reembolsado).`;
        }
    }
    if (Fecha_Pago !== undefined && Fecha_Pago !== null) {
        const f = new Date(Fecha_Pago);
        if (isNaN(f.getTime())) return 'Fecha_Pago inválida.';
    }
    return null;
}

// GET /api/ventas — Obtener todas las ventas
export const Obtener_Ventas = async (req, res) => {
    try {
        const ventas = await Venta.find()
            .populate('Cita_Asociada', 'date time style clientName')
            .populate('Cliente_Asociado', 'Nombre')
            .populate('Tatuador_Asociado', 'Nombre')
            .sort({ Fecha_Pago: -1 });
        res.status(200).json(ventas);
    } catch (error) {
        logger.error('Excepción en controller de Ventas', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/ventas/:id — Obtener una venta por ID
export const Obtener_Venta = async (req, res) => {
    try {
        const venta = await Venta.findById(req.params.id)
            .populate('Cita_Asociada', 'date time style clientName')
            .populate('Cliente_Asociado', 'Nombre')
            .populate('Tatuador_Asociado', 'Nombre');

        if (!venta) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }
        res.status(200).json(venta);
    } catch (error) {
        logger.error('Excepción en controller de Ventas', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/ventas — Registrar una venta
export const Crear_Venta = async (req, res) => {
    try {
        const {
            Cita_Asociada,
            Cliente_Asociado,
            Tatuador_Asociado,
            Descripcion_Servicio,
            Precio,
            Anticipo_Aplicado,
            Total_Pagado,
            Estado_Pago,
            Fecha_Pago,
        } = req.body;

        // Validaciones independientes de backend
        const errorValidacion = validarPayloadVenta(req.body, true);
        if (errorValidacion) {
            return res.status(400).json({ message: errorValidacion });
        }

        const nueva = await Venta.create({
            Cita_Asociada,
            Cliente_Asociado,
            Tatuador_Asociado,
            Descripcion_Servicio: Descripcion_Servicio ?? 'Sin comentarios',
            Realizado:            true,
            Precio,
            Anticipo_Aplicado:    Anticipo_Aplicado ?? 0,
            Total_Pagado:         Total_Pagado      ?? Precio,
            Estado_Pago:          Estado_Pago       ?? 1,
            Fecha_Pago:           Fecha_Pago        ?? Date.now(),
        });

        res.status(201).json({ message: 'Venta registrada.', venta: nueva });
    } catch (error) {
        logger.error('Excepción en controller de Ventas', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/ventas/:id — Actualizar una venta
export const Actualizar_Venta = async (req, res) => {
    try {
        // Validaciones independientes de backend (modo update)
        const errorValidacion = validarPayloadVenta(req.body, false);
        if (errorValidacion) {
            return res.status(400).json({ message: errorValidacion });
        }

        const {
            Descripcion_Servicio,
            Precio,
            Anticipo_Aplicado,
            Total_Pagado,
            Estado_Pago,
            Fecha_Pago,
            Realizado,
        } = req.body;

        const cambios = {};
        if (Descripcion_Servicio !== undefined) cambios.Descripcion_Servicio = Descripcion_Servicio;
        if (Precio               !== undefined) cambios.Precio               = Precio;
        if (Anticipo_Aplicado    !== undefined) cambios.Anticipo_Aplicado    = Anticipo_Aplicado;
        if (Total_Pagado         !== undefined) cambios.Total_Pagado         = Total_Pagado;
        if (Estado_Pago          !== undefined) cambios.Estado_Pago          = Estado_Pago;
        if (Fecha_Pago           !== undefined) cambios.Fecha_Pago           = Fecha_Pago;
        if (Realizado            !== undefined) cambios.Realizado            = Realizado;

        const actualizada = await Venta.findByIdAndUpdate(
            req.params.id,
            cambios,
            { new: true, runValidators: true }
        );

        if (!actualizada) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        res.status(200).json({ message: 'Venta actualizada.', venta: actualizada });
    } catch (error) {
        logger.error('Excepción en controller de Ventas', error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/ventas/:id — Eliminar una venta
export const Eliminar_Venta = async (req, res) => {
    try {
        if (!OBJECT_ID_REGEX.test(req.params.id || '')) {
            return res.status(400).json({ message: 'ID de venta inválido.' });
        }
        const eliminada = await Venta.findByIdAndDelete(req.params.id);

        if (!eliminada) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        res.status(200).json({ message: 'Venta eliminada.' });
    } catch (error) {
        logger.error('Excepción en controller de Ventas', error);
        res.status(500).json({ message: error.message });
    }
};
