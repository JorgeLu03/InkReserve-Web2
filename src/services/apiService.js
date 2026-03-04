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
