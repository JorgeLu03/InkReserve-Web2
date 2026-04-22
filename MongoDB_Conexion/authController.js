import { Usuario } from './schema.js';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || "testtest_clave";

export const Registrar_Usuario = async (req, res) => {
    try {
        //const { username, Correo_Electronico, password } = req.body;
        const { Nombre_Completo, Correo_Electronico, Contrasena, Telefono, Es_Admin, Esta_Activo} = req.body;

        
        const Usuario_Existe = await Usuario.findOne({ Correo_Electronico });
        
        
        //res.status(200).json({ message: "The route works, DB is the problem" });
        
        //Checar si usuario Existe
        if (Usuario_Existe) {
            return res.status(400).json({ message: "Usuario ya existe!"});
        }
        

        //Ingresar Usuario
        const Nuevo_Usuario = await Usuario.create({      
            Nombre_Completo,
            Correo_Electronico,
            Contrasena,
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
        

        res.status(201).json({ 
            message: "Usuario Registrado!",
            userId: Nuevo_Usuario._id 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const Logout_Usuario = (req, res) => {
    // Con JWT el token vive en el cliente; el logout formal
    // le indica al frontend que lo descarte.
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
};

export const Login_Usuario = async (req, res) => {
    try {
        const { Correo_Electronico, Contrasena } = req.body;

        // Buscar usuario por correo
        const usuario = await Usuario.findOne({ Correo_Electronico });

        if (!usuario) {
            return res.status(400).json({ message: "Usuario no existe!" });
        }

        // Validar contraseña DEL MISMO USUARIO
        if (usuario.Contrasena !== Contrasena) {
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

        return res.status(200).json({
            message: 'Login exitoso',
            token,
            Es_Admin: usuario.Es_Admin,
            Nombre_Completo: usuario.Nombre_Completo,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};