// ── Helpers ──────────────────────────────────────────────────────────────────
const BASE = '/api';

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
