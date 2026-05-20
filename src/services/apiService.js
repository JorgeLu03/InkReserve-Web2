// ── Helpers ──────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
    return localStorage.getItem('token') || '';
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
    };
}

async function handleResponse(res) {
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
}

// ── Citas ─────────────────────────────────────────────────────────────────────

export async function getCitas() {
    const res = await fetch(`${BASE}/citas`, { headers: authHeaders() });
    return handleResponse(res);
}

export async function createCita(appt) {
    const res = await fetch(`${BASE}/citas`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify(appt),
    });
    return handleResponse(res); // { message, cita }
}

export async function updateCita(id, changes) {
    const res = await fetch(`${BASE}/citas/${id}`, {
        method:  'PUT',
        headers: authHeaders(),
        body:    JSON.stringify(changes),
    });
    return handleResponse(res); // { message, cita }
}

export async function deleteCita(id) {
    const res = await fetch(`${BASE}/citas/${id}`, {
        method:  'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginUsuario(email, password) {
    const res = await fetch(`${BASE}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ Correo_Electronico: email, Contrasena: password }),
    });
    return handleResponse(res); // { token, Es_Admin, Nombre_Completo }
}

export async function registrarUsuario(data) {
    const res = await fetch(`${BASE}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
    });
    return handleResponse(res);
}

    // ── Tatuadores / Empleados ─────────────────────────────────────────────────

    /** Convierte un documento Tatuador de MongoDB al formato empleado del frontend */
    function tatuadorAEmpleado(doc) {
        return {
            _id:            doc._id,
            id:             doc.Id_Frontend || doc._id,
            artistId:       doc.Artist_Id_Numerico || 0,
            name:           doc.Nombre,
            initials:       doc.Iniciales || doc.Nombre?.slice(0, 2).toUpperCase() || '??',
            color:          doc.Color_Avatar || '#c084fc',
            photo:          doc.Foto_Base64 || null,
            resume:         doc.Curriculum || null,
            dateOfBirth:    doc.Fecha_Nacimiento || '',
            rfc:            doc.RFC || '',
            curp:           doc.CURP || '',
            specializations: Array.isArray(doc.Especialidades_Array) && doc.Especialidades_Array.length
                                ? doc.Especialidades_Array
                                : (doc.Especialidades && doc.Especialidades !== 'Ninguna' ? [doc.Especialidades] : []),
            workingHours: {
                start: doc.Horario_Inicio || '10:00',
                end:   doc.Horario_Fin   || '18:00',
                days:  doc.Horario_Dias_Array?.length ? doc.Horario_Dias_Array : [],
            },
            hourlyFee:      doc.Tarifa_Hora     || 0,
            monthlySalary:  doc.Salario_Mensual || 0,
            portfolio:      doc.Portafolio      || [],
            clockedIn:      doc.Esta_Fichado    ?? false,
            createdAt:      doc.createdAt ? doc.createdAt.slice(0, 10) : '',
        };
    }

    /** Convierte un empleado del frontend al formato que espera la API */
    function empleadoATatuador(emp) {
        return {
            Nombre:               emp.name,
            Iniciales:            emp.initials,
            Color_Avatar:         emp.color,
            Foto_Base64:          emp.photo    || null,
            Curriculum:           emp.resume   || null,
            Fecha_Nacimiento:     emp.dateOfBirth,
            RFC:                  emp.rfc,
            CURP:                 emp.curp,
            Especialidades_Array: emp.specializations,
            Especialidades:       emp.specializations.join(', ') || 'Ninguna',
            Horario_Inicio:       emp.workingHours.start,
            Horario_Fin:          emp.workingHours.end,
            Horario_Dias_Array:   emp.workingHours.days,
            Horario_Dias:         emp.workingHours.days.join(', '),
            Horario_Horas:        `${emp.workingHours.start} - ${emp.workingHours.end}`,
            Tarifa_Hora:          emp.hourlyFee,
            Salario_Mensual:      emp.monthlySalary,
            Portafolio:           emp.portfolio,
            Esta_Fichado:         emp.clockedIn,
            Esta_Disponible:      emp.clockedIn,
            Id_Frontend:          emp.id,
            Artist_Id_Numerico:   emp.artistId || Date.now(),
        };
    }

    export async function getTatuadores() {
        const res = await fetch(`${BASE}/tatuadores`, { headers: authHeaders() });
        const docs = await handleResponse(res);
        return docs.map(tatuadorAEmpleado);
    }

    export async function createTatuador(emp) {
        const res = await fetch(`${BASE}/tatuadores`, {
            method:  'POST',
            headers: authHeaders(),
            body:    JSON.stringify(empleadoATatuador(emp)),
        });
        const data = await handleResponse(res); // { message, tatuador }
        return tatuadorAEmpleado(data.tatuador);
    }

    export async function updateTatuador(mongoId, changes) {
        const res = await fetch(`${BASE}/tatuadores/${mongoId}`, {
            method:  'PUT',
            headers: authHeaders(),
            body:    JSON.stringify(empleadoATatuador(changes)),
        });
        const data = await handleResponse(res); // { message, tatuador }
        return tatuadorAEmpleado(data.tatuador);
    }

    export async function deleteTatuador(mongoId) {
        const res = await fetch(`${BASE}/tatuadores/${mongoId}`, {
            method:  'DELETE',
            headers: authHeaders(),
        });
        return handleResponse(res);
    }

// ── Reportes ──────────────────────────────────────────────────────────────────

/** GET /api/reportes/ganancias?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
 *  Devuelve { periodo, Total_Ganancias, Total_Anticipos, Total_Ventas } */
export async function getReporteGanancias(inicio, fin) {
    const qs = new URLSearchParams();
    if (inicio) qs.append('inicio', inicio);
    if (fin)    qs.append('fin', fin);
    const url = `${BASE}/reportes/ganancias${qs.toString() ? `?${qs}` : ''}`;
    const res = await fetch(url, { headers: authHeaders() });
    return handleResponse(res);
}

/** GET /api/reportes/servicios
 *  Devuelve [{ Estilo, Cantidad, Ingreso_Total }] */
export async function getReporteServicios() {
    const res = await fetch(`${BASE}/reportes/servicios`, { headers: authHeaders() });
    return handleResponse(res);
}

/** GET /api/reportes/citas-por-mes
 *  Devuelve [{ Año, Mes, Cantidad }] */
export async function getReporteCitasPorMes() {
    const res = await fetch(`${BASE}/reportes/citas-por-mes`, { headers: authHeaders() });
    return handleResponse(res);
}

/** GET /api/reportes/clientes-frecuentes
 *  Devuelve [{ Cliente, Total_Citas, Total_Gastado }] (top 20) */
export async function getReporteClientesFrecuentes() {
    const res = await fetch(`${BASE}/reportes/clientes-frecuentes`, { headers: authHeaders() });
    return handleResponse(res);
}

// ── Servicios / Categorías ────────────────────────────────────────────────────
// La collection Categoria del backend representa los estilos de tatuaje.
// Se usa en creación de citas y de tatuadores. Solo admin puede modificar.

/** GET /api/servicios — lista todas las categorías */
export async function getServicios() {
    const res = await fetch(`${BASE}/servicios`, { headers: authHeaders() });
    return handleResponse(res); // [{ _id, Titulo }, ...]
}

/** POST /api/servicios — crea una categoría (admin) */
export async function createServicio(titulo) {
    const res = await fetch(`${BASE}/servicios`, {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({ Titulo: titulo }),
    });
    return handleResponse(res); // { message, servicio }
}

/** PUT /api/servicios/:id — renombra una categoría (admin) */
export async function updateServicio(id, titulo) {
    const res = await fetch(`${BASE}/servicios/${id}`, {
        method:  'PUT',
        headers: authHeaders(),
        body:    JSON.stringify({ Titulo: titulo }),
    });
    return handleResponse(res); // { message, servicio }
}

/** DELETE /api/servicios/:id — elimina una categoría (admin) */
export async function deleteServicio(id) {
    const res = await fetch(`${BASE}/servicios/${id}`, {
        method:  'DELETE',
        headers: authHeaders(),
    });
    return handleResponse(res);
}

// ── Usuarios (gestión administrativa) ─────────────────────────────────────────
// Todos requieren token de admin. La contraseña NUNCA viaja al frontend.

/** GET /api/usuarios — lista todos los usuarios (sin contraseña) */
export async function getUsuarios() {
    const res = await fetch(`${BASE}/usuarios`, { headers: authHeaders() });
    return handleResponse(res);
}

/** GET /api/usuarios/:id — obtiene un usuario por id (sin contraseña) */
export async function getUsuario(id) {
    const res = await fetch(`${BASE}/usuarios/${id}`, { headers: authHeaders() });
    return handleResponse(res);
}

/** PUT /api/usuarios/:id — actualiza campos administrativos.
 *  Campos permitidos en `changes`: Nombre_Completo, Telefono, Es_Admin, Esta_Activo.
 *  No se puede cambiar correo ni contraseña desde aquí. */
export async function updateUsuario(id, changes) {
    const res = await fetch(`${BASE}/usuarios/${id}`, {
        method:  'PUT',
        headers: authHeaders(),
        body:    JSON.stringify(changes),
    });
    return handleResponse(res); // { message, usuario }
}
