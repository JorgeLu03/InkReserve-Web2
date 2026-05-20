// Utilidad simple de logging a archivo.
// Registra errores y procesos críticos en MongoDB_Conexion/logs/app.log
// con timestamp ISO + nivel + mensaje.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const LOGS_DIR  = path.join(__dirname, 'logs');
const LOG_FILE  = path.join(LOGS_DIR, 'app.log');

// Crear carpeta logs si no existe (la primera vez que arranca el server)
try {
    if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });
} catch (e) {
    // si falla la creación, los writes simplemente no escriben — no rompemos el server
    console.error('No se pudo crear carpeta de logs:', e.message);
}

function escribir(nivel, mensaje, extra) {
    const ts = new Date().toISOString();
    const detalle = extra ? ` | ${typeof extra === 'string' ? extra : JSON.stringify(extra)}` : '';
    const linea = `[${ts}] [${nivel}] ${mensaje}${detalle}\n`;
    // Append asincrónico para no bloquear el event loop; si falla, lo mandamos a consola
    fs.appendFile(LOG_FILE, linea, (err) => {
        if (err) console.error('Error escribiendo log:', err.message);
    });
}

export const logger = {
    info:  (msg, extra) => escribir('INFO',  msg, extra),
    warn:  (msg, extra) => escribir('WARN',  msg, extra),
    error: (msg, err)   => escribir('ERROR', msg, err?.stack || err?.message || err),
};

export default logger;
