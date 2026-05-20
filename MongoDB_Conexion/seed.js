// ════════════════════════════════════════════════════════════════════
// SCRIPT DE SEED — Carga datos de demostración en la base de datos.
//
// USO: `npm run seed`
//
// ADVERTENCIA: este script BORRA todas las collections existentes
// (Usuarios, Tatuadores, Clientes, Citas, Categorias, Ventas) antes
// de insertar los datos nuevos. Úsalo solo en desarrollo / demo.
//
// Contraseñas de los usuarios creados (todas hasheadas con bcrypt):
//   admin@inkreserve.com      / admin123     (Es_Admin: true)
//   recepcion@inkreserve.com  / recepcion123 (Es_Admin: false)
//   inactivo@inkreserve.com   / inactivo123  (Esta_Activo: false — bloqueado al hacer login)
// ════════════════════════════════════════════════════════════════════

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
    Usuario,
    Cliente,
    Tatuador,
    Categoria,
    Cita,
    Venta,
    Foto_Tatuaje,
} from './schema.js';

const MONGO_URI  = process.env.MONGO_URI || 'mongodb://localhost:27017/Ink_Reserve';
const SALT_ROUNDS = 10;

// ── Helpers ──────────────────────────────────────────────────────────
function fechaISO(year, monthIdx, day) {
    return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function iniciales(nombre) {
    return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

const COLORES = ['#7c3aed', '#0ea5e9', '#16a34a', '#d97706', '#ec4899', '#0891b2', '#a855f7', '#f97316'];
const colorParaIdx = (i) => COLORES[i % COLORES.length];

// ── Limpieza ─────────────────────────────────────────────────────────
async function limpiarColecciones() {
    console.log('🧹 Limpiando collections existentes…');
    await Promise.all([
        Usuario.deleteMany({}),
        Cliente.deleteMany({}),
        Tatuador.deleteMany({}),
        Categoria.deleteMany({}),
        Cita.deleteMany({}),
        Venta.deleteMany({}),
        Foto_Tatuaje.deleteMany({}),
    ]);
    console.log('✓ Collections vaciadas.');
}

// ── Seeders ──────────────────────────────────────────────────────────
async function seedUsuarios() {
    console.log('👥 Insertando usuarios…');
    const hash = (p) => bcrypt.hash(p, SALT_ROUNDS);

    const usuarios = await Usuario.insertMany([
        {
            Nombre_Completo:    'Manuel Administrador',
            Correo_Electronico: 'admin@inkreserve.com',
            Contrasena:         await hash('admin123'),
            Telefono:           '8181234567',
            Es_Admin:           true,
            Esta_Activo:        true,
        },
        {
            Nombre_Completo:    'Sofia Recepcionista',
            Correo_Electronico: 'recepcion@inkreserve.com',
            Contrasena:         await hash('recepcion123'),
            Telefono:           '8181111111',
            Es_Admin:           false,
            Esta_Activo:        true,
        },
        {
            Nombre_Completo:    'Cuenta Inactiva',
            Correo_Electronico: 'inactivo@inkreserve.com',
            Contrasena:         await hash('inactivo123'),
            Telefono:           '8182222222',
            Es_Admin:           false,
            Esta_Activo:        false,
        },
    ]);
    console.log(`✓ ${usuarios.length} usuarios insertados.`);
    return usuarios;
}

async function seedCategorias() {
    console.log('🎨 Insertando categorías de tatuaje…');
    const titulos = [
        'Blackwork',
        'Realismo',
        'Fine Line',
        'Acuarela',
        'Neotradicional',
        'Japonés',
        'Geométrico',
        'Americano Tradicional',
    ];
    const categorias = await Categoria.insertMany(titulos.map((Titulo) => ({ Titulo })));
    console.log(`✓ ${categorias.length} categorías insertadas.`);
    return categorias;
}

async function seedTatuadores() {
    console.log('💉 Insertando tatuadores…');
    const baseId = Date.now();
    const tatuadores = await Tatuador.insertMany([
        {
            Nombre:               'Diego Ramírez',
            Iniciales:            'DR',
            Color_Avatar:         '#f472b6',
            Especialidades_Array: ['Blackwork', 'Fine Line', 'Geométrico'],
            Especialidades:       'Blackwork, Fine Line, Geométrico',
            Horario_Inicio:       '10:00',
            Horario_Fin:          '18:00',
            Horario_Dias_Array:   ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            Tarifa_Hora:          850,
            Salario_Mensual:      22000,
            Esta_Fichado:         true,
            Esta_Disponible:      true,
            Artist_Id_Numerico:   baseId + 1,
            Fecha_Nacimiento:     '1992-05-15',
            RFC:                  'RADI920515ABC',
            CURP:                 'RADI920515HDFRML01',
        },
        {
            Nombre:               'Valentina Cruz',
            Iniciales:            'VC',
            Color_Avatar:         '#38bdf8',
            Especialidades_Array: ['Acuarela', 'Realismo', 'Fine Line'],
            Especialidades:       'Acuarela, Realismo, Fine Line',
            Horario_Inicio:       '12:00',
            Horario_Fin:          '20:00',
            Horario_Dias_Array:   ['Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            Tarifa_Hora:          900,
            Salario_Mensual:      24000,
            Esta_Fichado:         true,
            Esta_Disponible:      true,
            Artist_Id_Numerico:   baseId + 2,
            Fecha_Nacimiento:     '1995-08-22',
        },
        {
            Nombre:               'Marcos Leal',
            Iniciales:            'ML',
            Color_Avatar:         '#fb923c',
            Especialidades_Array: ['Japonés', 'Neotradicional', 'Realismo'],
            Especialidades:       'Japonés, Neotradicional, Realismo',
            Horario_Inicio:       '14:00',
            Horario_Fin:          '22:00',
            Horario_Dias_Array:   ['Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            Tarifa_Hora:          1000,
            Salario_Mensual:      26000,
            Esta_Fichado:         true,
            Esta_Disponible:      true,
            Artist_Id_Numerico:   baseId + 3,
            Fecha_Nacimiento:     '1988-11-03',
        },
        {
            Nombre:               'Sofía Reyes',
            Iniciales:            'SR',
            Color_Avatar:         '#4ade80',
            Especialidades_Array: ['Americano Tradicional', 'Neotradicional', 'Geométrico'],
            Especialidades:       'Americano Tradicional, Neotradicional, Geométrico',
            Horario_Inicio:       '09:00',
            Horario_Fin:          '17:00',
            Horario_Dias_Array:   ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            Tarifa_Hora:          800,
            Salario_Mensual:      21000,
            Esta_Fichado:         true,
            Esta_Disponible:      true,
            Artist_Id_Numerico:   baseId + 4,
            Fecha_Nacimiento:     '1997-02-19',
        },
    ]);
    console.log(`✓ ${tatuadores.length} tatuadores insertados.`);
    return tatuadores;
}

async function seedClientes() {
    console.log('🙋 Insertando clientes…');
    const nombres = [
        'Camila Torres',     'Rodrigo Méndez',   'Sara Vidal',
        'Lucía Fernández',   'Daniel Mora',      'Ana Ruiz',
        'Carlos Pérez',      'Mariana López',    'Pablo Herrera',
        'Isabela Ortega',    'José Ramírez',     'Valeria Castro',
    ];
    const clientes = await Cliente.insertMany(nombres.map((Nombre) => ({
        Nombre,
        Notas_Importantes: 'Ninguna',
        Preferencias:      'Ninguna',
        Citas_Anteriores:  Math.floor(Math.random() * 5),
        Total_Gastado:     0,
    })));
    console.log(`✓ ${clientes.length} clientes insertados.`);
    return clientes;
}

async function seedCitas(tatuadores) {
    console.log('📅 Insertando citas…');
    const hoy = new Date();
    const año = hoy.getFullYear();

    // Distribución por mes: el reporte de citas-por-mes mostrará variación natural.
    // Mezcla de status para que ganancias (status=completed) sume valores reales.
    const citas = [
        // Hace 5 meses
        { offsetMeses: -5, day: 4,  artistIdx: 0, time: '10:00', hours: 3, style: 'Blackwork',              dimensions: '15 × 10 cm', total: 2400, status: 'completed', clientName: 'Camila Torres' },
        { offsetMeses: -5, day: 12, artistIdx: 1, time: '13:30', hours: 2, style: 'Acuarela',               dimensions: '12 × 8 cm',  total: 1800, status: 'completed', clientName: 'Rodrigo Méndez' },
        { offsetMeses: -5, day: 22, artistIdx: 2, time: '16:00', hours: 4, style: 'Japonés',                dimensions: '20 × 15 cm', total: 3600, status: 'completed', clientName: 'Sara Vidal' },

        // Hace 4 meses
        { offsetMeses: -4, day: 3,  artistIdx: 3, time: '09:00', hours: 2, style: 'Americano Tradicional', dimensions: '10 × 10 cm', total: 1600, status: 'completed', clientName: 'Lucía Fernández' },
        { offsetMeses: -4, day: 11, artistIdx: 0, time: '11:00', hours: 5, style: 'Fine Line',              dimensions: '18 × 12 cm', total: 4250, status: 'completed', clientName: 'Daniel Mora' },
        { offsetMeses: -4, day: 18, artistIdx: 1, time: '15:00', hours: 3, style: 'Realismo',               dimensions: '14 × 14 cm', total: 2700, status: 'completed', clientName: 'Ana Ruiz' },
        { offsetMeses: -4, day: 25, artistIdx: 2, time: '17:00', hours: 2, style: 'Neotradicional',         dimensions: '10 × 10 cm', total: 2000, status: 'cancelled', clientName: 'Carlos Pérez', cancellationFee: 600 },

        // Hace 3 meses
        { offsetMeses: -3, day: 5,  artistIdx: 3, time: '10:00', hours: 3, style: 'Geométrico',             dimensions: '12 × 12 cm', total: 2400, status: 'completed', clientName: 'Mariana López' },
        { offsetMeses: -3, day: 14, artistIdx: 0, time: '14:00', hours: 4, style: 'Blackwork',              dimensions: '22 × 16 cm', total: 3400, status: 'completed', clientName: 'Pablo Herrera' },
        { offsetMeses: -3, day: 21, artistIdx: 1, time: '12:30', hours: 2, style: 'Fine Line',              dimensions: '8 × 8 cm',   total: 1800, status: 'completed', clientName: 'Isabela Ortega' },
        { offsetMeses: -3, day: 28, artistIdx: 2, time: '18:00', hours: 3, style: 'Japonés',                dimensions: '16 × 12 cm', total: 3000, status: 'completed', clientName: 'José Ramírez' },

        // Hace 2 meses
        { offsetMeses: -2, day: 2,  artistIdx: 3, time: '09:30', hours: 2, style: 'Americano Tradicional', dimensions: '10 × 8 cm',  total: 1600, status: 'completed', clientName: 'Valeria Castro' },
        { offsetMeses: -2, day: 9,  artistIdx: 0, time: '11:00', hours: 3, style: 'Geométrico',             dimensions: '14 × 10 cm', total: 2550, status: 'completed', clientName: 'Camila Torres' },
        { offsetMeses: -2, day: 16, artistIdx: 1, time: '14:00', hours: 4, style: 'Acuarela',               dimensions: '20 × 15 cm', total: 3600, status: 'completed', clientName: 'Rodrigo Méndez' },
        { offsetMeses: -2, day: 23, artistIdx: 2, time: '15:30', hours: 5, style: 'Realismo',               dimensions: '25 × 20 cm', total: 5000, status: 'completed', clientName: 'Sara Vidal' },

        // Hace 1 mes
        { offsetMeses: -1, day: 7,  artistIdx: 3, time: '10:00', hours: 2, style: 'Neotradicional',         dimensions: '12 × 8 cm',  total: 1800, status: 'completed', clientName: 'Lucía Fernández' },
        { offsetMeses: -1, day: 13, artistIdx: 0, time: '12:00', hours: 3, style: 'Blackwork',              dimensions: '15 × 12 cm', total: 2550, status: 'completed', clientName: 'Daniel Mora' },
        { offsetMeses: -1, day: 20, artistIdx: 1, time: '16:00', hours: 2, style: 'Fine Line',              dimensions: '10 × 6 cm',  total: 1700, status: 'in_progress', clientName: 'Mariana López' },

        // Este mes (mezcla de pending / confirmed)
        { offsetMeses: 0,  day: 5,  artistIdx: 2, time: '13:00', hours: 4, style: 'Japonés',                dimensions: '20 × 15 cm', total: 4000, status: 'confirmed', clientName: 'Pablo Herrera' },
        { offsetMeses: 0,  day: 12, artistIdx: 3, time: '11:00', hours: 2, style: 'Americano Tradicional', dimensions: '10 × 10 cm', total: 1600, status: 'pending',   clientName: 'Isabela Ortega' },
        { offsetMeses: 0,  day: 19, artistIdx: 0, time: '15:00', hours: 3, style: 'Geométrico',             dimensions: '14 × 14 cm', total: 2550, status: 'confirmed', clientName: 'Camila Torres' },

        // Próximo mes (citas futuras)
        { offsetMeses: 1,  day: 8,  artistIdx: 1, time: '12:00', hours: 3, style: 'Acuarela',               dimensions: '15 × 12 cm', total: 2700, status: 'pending',   clientName: 'José Ramírez' },
        { offsetMeses: 1,  day: 18, artistIdx: 2, time: '14:00', hours: 4, style: 'Realismo',               dimensions: '18 × 14 cm', total: 4000, status: 'pending',   clientName: 'Valeria Castro' },
    ];

    const docs = citas.map((c) => {
        const fecha = new Date(año, hoy.getMonth() + c.offsetMeses, c.day);
        const tatuador = tatuadores[c.artistIdx];
        const date = fechaISO(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
        return {
            clientName:     c.clientName,
            clientInitials: iniciales(c.clientName),
            clientColor:    colorParaIdx(c.artistIdx),
            artistId:       tatuador.Artist_Id_Numerico,
            date,
            time:           c.time,
            hours:          c.hours,
            style:          c.style,
            dimensions:     c.dimensions,
            total_precio:   c.total,
            tattooKey:      'rose',
            status:         c.status,
            cancellationFee: c.cancellationFee || 0,
            Estado_Cita:    { pending: 0, confirmed: 1, in_progress: 2, completed: 3, cancelled: 4 }[c.status] ?? 0,
            Anticipo:       Math.floor(c.total * 0.3),
            Fecha_y_Hora:   new Date(`${date}T${c.time}:00`),
            Duracion_Estimada: c.hours * 60,
            refImages:      [],
        };
    });

    const insertadas = await Cita.insertMany(docs);
    console.log(`✓ ${insertadas.length} citas insertadas.`);
    return insertadas;
}

async function seedVentas(citas, clientes, tatuadores) {
    console.log('💰 Insertando ventas para citas completadas…');
    const completadas = citas.filter((c) => c.status === 'completed');

    // Mapeo simple: cada venta referencia su cita, un cliente y un tatuador
    // según el artistId numérico de la cita.
    const ventas = completadas.map((cita, i) => {
        const tat = tatuadores.find((t) => t.Artist_Id_Numerico === cita.artistId) || tatuadores[0];
        const cli = clientes[i % clientes.length];
        return {
            Cita_Asociada:        cita._id,
            Cliente_Asociado:     cli._id,
            Tatuador_Asociado:    tat._id,
            Descripcion_Servicio: `${cita.style} — ${cita.dimensions}`,
            Realizado:            true,
            Precio:               cita.total_precio,
            Anticipo_Aplicado:    Math.floor(cita.total_precio * 0.3),
            Total_Pagado:         cita.total_precio,
            Estado_Pago:          0, // 0-Pagado
            Fecha_Pago:           cita.Fecha_y_Hora,
        };
    });

    const insertadas = await Venta.insertMany(ventas);
    console.log(`✓ ${insertadas.length} ventas insertadas.`);
    return insertadas;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  🌱 Seed de InkReserve — datos de demostración');
    console.log('══════════════════════════════════════════════════════════\n');

    try {
        await mongoose.connect(MONGO_URI);
        console.log(`✓ Conectado a MongoDB en ${MONGO_URI}\n`);

        await limpiarColecciones();
        console.log('');

        const usuarios   = await seedUsuarios();
        const categorias = await seedCategorias();
        const tatuadores = await seedTatuadores();
        const clientes   = await seedClientes();
        const citas      = await seedCitas(tatuadores);
        const ventas     = await seedVentas(citas, clientes, tatuadores);

        console.log('\n──────────────────────────────────────────────────────────');
        console.log('  ✅ Seed completado exitosamente.');
        console.log('──────────────────────────────────────────────────────────');
        console.log(`  Usuarios:    ${usuarios.length}`);
        console.log(`  Categorías:  ${categorias.length}`);
        console.log(`  Tatuadores:  ${tatuadores.length}`);
        console.log(`  Clientes:    ${clientes.length}`);
        console.log(`  Citas:       ${citas.length}`);
        console.log(`  Ventas:      ${ventas.length}`);
        console.log('──────────────────────────────────────────────────────────');
        console.log('\n  Cuentas de acceso:');
        console.log('  • admin@inkreserve.com     / admin123      (Admin)');
        console.log('  • recepcion@inkreserve.com / recepcion123  (Usuario)');
        console.log('  • inactivo@inkreserve.com  / inactivo123   (BLOQUEADO)');
        console.log('\n');
    } catch (err) {
        console.error('\n❌ Error durante el seed:', err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

main();
