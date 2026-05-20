import { Usuario } from './schema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logger } from './logger.js';
const JWT_SECRET = process.env.JWT_SECRET || "testtest_clave";
const SALT_ROUNDS = 10;

// ── Regex de validación ──────────────────────────────────────────────────────
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_REGEX = /^\d{10}$/; // 10 dígitos exactos

export const Registrar_Usuario = async (req, res) => {
    logger.info('Inicio: Registrar_Usuario', { correo: req.body?.Correo_Electronico });
    try {
        //const { username, Correo_Electronico, password } = req.body;
        const { Nombre_Completo, Correo_Electronico, Contrasena, Telefono, Es_Admin, Esta_Activo} = req.body;

        // ── Validaciones independientes de backend ─────────────────────────
        if (!Nombre_Completo || Nombre_Completo.trim().length < 5) {
            return res.status(400).json({ message: 'Nombre completo debe tener al menos 5 caracteres.' });
        }
        if (!Correo_Electronico || !EMAIL_REGEX.test(Correo_Electronico)) {
            return res.status(400).json({ message: 'Formato de correo electrónico inválido.' });
        }
        if (!Contrasena || Contrasena.length < 5) {
            return res.status(400).json({ message: 'La contraseña debe tener al menos 5 caracteres.' });
        }
        if (Telefono && !TELEFONO_REGEX.test(String(Telefono))) {
            return res.status(400).json({ message: 'El teléfono debe tener exactamente 10 dígitos.' });
        }

        const Usuario_Existe = await Usuario.findOne({ Correo_Electronico });
        
        
        //res.status(200).json({ message: "The route works, DB is the problem" });
        
        //Checar si usuario Existe
        if (Usuario_Existe) {
            return res.status(400).json({ message: "Usuario ya existe!"});
        }
        

        //Hashear contraseña antes de guardar
        const Contrasena_Hash = await bcrypt.hash(Contrasena, SALT_ROUNDS);

        //Ingresar Usuario
        const Nuevo_Usuario = await Usuario.create({
            Nombre_Completo,
            Correo_Electronico,
            Contrasena: Contrasena_Hash,
            Telefono,
            Es_Admin,
            Esta_Activo
        });
        /*
        Ejemplo de info a llenar
        const Nuevo_Usuario = await Usuario.create({      
            Nombre_Completo: 'Nombre Temp',
            Correo_Electronico: 'Temp@hotmail.com',
            Contrasena: 'minmin123',
            Telefono: '8123454522',
            Es_Admin: false,
            Esta_Activo: false
        });*/
        

        logger.info('Fin: Registrar_Usuario OK', { userId: Nuevo_Usuario._id.toString() });
        res.status(201).json({
            message: "Usuario Registrado!",
            userId: Nuevo_Usuario._id
        });
    } catch (error) {
        logger.error('Excepción en Registrar_Usuario', error);
        res.status(500).json({ message: error.message });
    }
};

export const Logout_Usuario = (req, res) => {
    // Con JWT el token vive en el cliente; el logout formal
    // le indica al frontend que lo descarte.
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
};

export const Login_Usuario = async (req, res) => {
    logger.info('Inicio: Login_Usuario', { correo: req.body?.Correo_Electronico });
    try {
        const { Correo_Electronico, Contrasena } = req.body;

        // Validación independiente: formato mínimo
        if (!Correo_Electronico || !EMAIL_REGEX.test(Correo_Electronico)) {
            return res.status(400).json({ message: 'Formato de correo electrónico inválido.' });
        }
        if (!Contrasena || typeof Contrasena !== 'string' || Contrasena.length < 5) {
            return res.status(400).json({ message: 'Contraseña inválida.' });
        }

        // Buscar usuario por correo
        const usuario = await Usuario.findOne({ Correo_Electronico });

        if (!usuario) {
            return res.status(400).json({ message: "Usuario no existe!" });
        }

        // Bloquear acceso a cuentas dadas de baja por un admin
        if (usuario.Esta_Activo === false) {
            logger.warn('Intento de login con cuenta inactiva', { userId: usuario._id.toString() });
            return res.status(403).json({ message: "Tu cuenta ha sido desactivada. Contacta al administrador." });
        }

        // Validar contraseña DEL MISMO USUARIO
        // Si la contraseña almacenada empieza con "$2" es un hash bcrypt.
        // Si no, es un usuario legacy en texto plano: lo migramos al vuelo.
        const guardada = usuario.Contrasena || '';
        const pareceHash = typeof guardada === 'string' && guardada.startsWith('$2');
        let passwordValida = false;

        if (pareceHash) {
            passwordValida = await bcrypt.compare(Contrasena, guardada);
        } else if (guardada === Contrasena) {
            // Usuario antiguo en texto plano: migrar a hash
            passwordValida = true;
            usuario.Contrasena = await bcrypt.hash(Contrasena, SALT_ROUNDS);
            await usuario.save();
        }

        if (!passwordValida) {
            return res.status(400).json({ message: "Contraseña incorrecta!" });
        }

        // Crear token
        const token = jwt.sign(
            {
                id: usuario._id,
                Es_Admin: usuario.Es_Admin,
                Nombre_Completo: usuario.Nombre_Completo,
                Correo_Electronico: usuario.Correo_Electronico,
                Telefono: usuario.Telefono
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        logger.info('Fin: Login_Usuario OK', { userId: usuario._id.toString(), esAdmin: usuario.Es_Admin });
        return res.status(200).json({
            message: 'Login exitoso',
            token,
            Es_Admin: usuario.Es_Admin,
            Nombre_Completo: usuario.Nombre_Completo,
        });

    } catch (error) {
        logger.error('Excepción en Login_Usuario', error);
        res.status(500).json({ message: error.message });
    }
};