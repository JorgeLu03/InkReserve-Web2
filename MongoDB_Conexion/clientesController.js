import { Cliente } from './schema.js';
import { logger } from './logger.js';

// GET /api/clientes — Obtener todos los clientes
export const Obtener_Clientes = async (req, res) => {
    try {
        const clientes = await Cliente.find().sort({ Nombre: 1 });
        res.status(200).json(clientes);
    } catch (error) {
        logger.error('Excepción en controller de Clientes', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/clientes/:id — Obtener un cliente por ID
export const Obtener_Cliente = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }
        res.status(200).json(cliente);
    } catch (error) {
        logger.error('Excepción en controller de Clientes', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/clientes — Registrar un cliente
export const Crear_Cliente = async (req, res) => {
    try {
        const {
            Nombre,
            Fecha_Nacimiento,
            Notas_Importantes,
            Preferencias,
        } = req.body;

        // Validaciones independientes de backend
        if (!Nombre || Nombre.trim().length < 2) {
            return res.status(400).json({ message: 'El nombre del cliente es obligatorio (mínimo 2 caracteres).' });
        }
        if (Nombre.trim().length > 100) {
            return res.status(400).json({ message: 'El nombre no puede exceder 100 caracteres.' });
        }
        if (Fecha_Nacimiento) {
            const fechaParseada = new Date(Fecha_Nacimiento);
            if (isNaN(fechaParseada.getTime())) {
                return res.status(400).json({ message: 'Fecha de nacimiento inválida.' });
            }
            if (fechaParseada > new Date()) {
                return res.status(400).json({ message: 'La fecha de nacimiento no puede ser futura.' });
            }
        }

        const nuevo = await Cliente.create({
            Nombre:             Nombre.trim(),
            Fecha_Nacimiento:   Fecha_Nacimiento   ?? null,
            Notas_Importantes:  Notas_Importantes  ?? 'Ninguna',
            Preferencias:       Preferencias       ?? 'Ninguna',
            Citas_Anteriores:   0,
            Total_Gastado:      0,
        });

        res.status(201).json({ message: 'Cliente registrado.', cliente: nuevo });
    } catch (error) {
        logger.error('Excepción en controller de Clientes', error);
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/clientes/:id — Actualizar un cliente
export const Actualizar_Cliente = async (req, res) => {
    try {
        const {
            Nombre,
            Fecha_Nacimiento,
            Notas_Importantes,
            Preferencias,
            Citas_Anteriores,
            Total_Gastado,
        } = req.body;

        // Validaciones independientes de backend
        if (Nombre !== undefined && Nombre.trim().length < 2) {
            return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres.' });
        }
        if (Nombre !== undefined && Nombre.trim().length > 100) {
            return res.status(400).json({ message: 'El nombre no puede exceder 100 caracteres.' });
        }
        if (Citas_Anteriores !== undefined) {
            const n = Number(Citas_Anteriores);
            if (!Number.isInteger(n) || n < 0) {
                return res.status(400).json({ message: 'Citas_Anteriores debe ser un entero >= 0.' });
            }
        }
        if (Total_Gastado !== undefined) {
            const t = Number(Total_Gastado);
            if (!Number.isFinite(t) || t < 0) {
                return res.status(400).json({ message: 'Total_Gastado debe ser un número >= 0.' });
            }
        }

        const cambios = {};
        if (Nombre             !== undefined) cambios.Nombre             = Nombre.trim();
        if (Fecha_Nacimiento   !== undefined) cambios.Fecha_Nacimiento   = Fecha_Nacimiento;
        if (Notas_Importantes  !== undefined) cambios.Notas_Importantes  = Notas_Importantes;
        if (Preferencias       !== undefined) cambios.Preferencias       = Preferencias;
        if (Citas_Anteriores   !== undefined) cambios.Citas_Anteriores   = Citas_Anteriores;
        if (Total_Gastado      !== undefined) cambios.Total_Gastado      = Total_Gastado;

        const actualizado = await Cliente.findByIdAndUpdate(
            req.params.id,
            cambios,
            { new: true, runValidators: true }
        );

        if (!actualizado) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        res.status(200).json({ message: 'Cliente actualizado.', cliente: actualizado });
    } catch (error) {
        logger.error('Excepción en controller de Clientes', error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/clientes/:id — Eliminar un cliente
export const Eliminar_Cliente = async (req, res) => {
    try {
        const eliminado = await Cliente.findByIdAndDelete(req.params.id);

        if (!eliminado) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }

        res.status(200).json({ message: 'Cliente eliminado.' });
    } catch (error) {
        logger.error('Excepción en controller de Clientes', error);
        res.status(500).json({ message: error.message });
    }
};
