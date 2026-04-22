import { Venta, Cita } from './schema.js';

// GET /api/reportes/ganancias?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
// Ganancia total por periodo (suma de Total_Pagado en Ventas)
export const Reporte_Ganancias = async (req, res) => {
    try {
        const { inicio, fin } = req.query;

        const filtro = {};
        if (inicio || fin) {
            filtro.Fecha_Pago = {};
            if (inicio) filtro.Fecha_Pago.$gte = new Date(inicio);
            if (fin)    filtro.Fecha_Pago.$lte = new Date(fin + 'T23:59:59.999Z');
        }

        const resultado = await Venta.aggregate([
            { $match: filtro },
            {
                $group: {
                    _id:              null,
                    Total_Ganancias:  { $sum: '$Total_Pagado' },
                    Total_Anticipos:  { $sum: '$Anticipo_Aplicado' },
                    Total_Ventas:     { $sum: 1 },
                }
            }
        ]);

        const data = resultado[0] ?? {
            Total_Ganancias: 0,
            Total_Anticipos: 0,
            Total_Ventas:    0,
        };

        res.status(200).json({
            periodo: { inicio: inicio ?? 'sin límite', fin: fin ?? 'sin límite' },
            ...data,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reportes/servicios
// Servicios (estilos) más vendidos por cantidad y por ingreso
export const Reporte_Servicios = async (req, res) => {
    try {
        const resultado = await Cita.aggregate([
            { $match: { style: { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id:           '$style',
                    Cantidad:      { $sum: 1 },
                    Ingreso_Total: { $sum: '$total_precio' },
                }
            },
            { $sort: { Cantidad: -1 } },
            { $project: { _id: 0, Estilo: '$_id', Cantidad: 1, Ingreso_Total: 1 } }
        ]);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reportes/citas-por-mes
// Cantidad de citas agrupadas por mes
export const Reporte_Citas_Por_Mes = async (req, res) => {
    try {
        const resultado = await Cita.aggregate([
            { $match: { date: { $exists: true, $ne: '' } } },
            {
                $addFields: {
                    Fecha_Parsed: {
                        $dateFromString: { dateString: '$date', format: '%Y-%m-%d' }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        Año: { $year:  '$Fecha_Parsed' },
                        Mes: { $month: '$Fecha_Parsed' },
                    },
                    Cantidad: { $sum: 1 },
                }
            },
            { $sort: { '_id.Año': 1, '_id.Mes': 1 } },
            {
                $project: {
                    _id:      0,
                    Año:      '$_id.Año',
                    Mes:      '$_id.Mes',
                    Cantidad: 1,
                }
            }
        ]);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reportes/clientes-frecuentes
// Top clientes por número de citas y total gastado
export const Reporte_Clientes_Frecuentes = async (req, res) => {
    try {
        const resultado = await Cita.aggregate([
            { $match: { clientName: { $exists: true, $ne: '' } } },
            {
                $group: {
                    _id:           '$clientName',
                    Total_Citas:   { $sum: 1 },
                    Total_Gastado: { $sum: '$total_precio' },
                }
            },
            { $sort: { Total_Citas: -1 } },
            { $limit: 20 },
            {
                $project: {
                    _id:           0,
                    Cliente:       '$_id',
                    Total_Citas:   1,
                    Total_Gastado: 1,
                }
            }
        ]);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
