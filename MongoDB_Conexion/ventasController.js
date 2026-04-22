import { Venta } from './schema.js';

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

        if (!Cita_Asociada || !Cliente_Asociado || !Tatuador_Asociado) {
            return res.status(400).json({ message: 'Cita_Asociada, Cliente_Asociado y Tatuador_Asociado son obligatorios.' });
        }
        if (Precio === undefined || Precio === null) {
            return res.status(400).json({ message: 'El precio es obligatorio.' });
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
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/ventas/:id — Actualizar una venta
export const Actualizar_Venta = async (req, res) => {
    try {
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
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/ventas/:id — Eliminar una venta
export const Eliminar_Venta = async (req, res) => {
    try {
        const eliminada = await Venta.findByIdAndDelete(req.params.id);

        if (!eliminada) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        res.status(200).json({ message: 'Venta eliminada.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
