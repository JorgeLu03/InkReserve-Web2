import { Usuario } from './schema.js';

export const Registrar_Usuario = async (req, res) => {
    try {
        //const { username, Correo_Electronico, password } = req.body;
        const { Correo_Electronico, Contrasena } = req.body;

        // 1. Check if user already exists
        
        const existingUser = await Usuario.findOne({ Correo_Electronico });
        
        
        //res.status(200).json({ message: "The route works, DB is the problem" });


        if (existingUser) {
            return res.status(201).json({ message: "Usuario ya existe!"});
        }
        else{
            return res.status(400).json({ 
            message: "Usuario no existe!"
        });
        }

        // 2. Create the user (In a real app, hash the password first!)
        /*
        const newUser = await User.create({
        username,
        Correo_Electronico,
        password 
        });*/
        const newUser = await Usuario.create({      
            Nombre_Completo: 'Nombre Temp',
            Correo_Electronico: 'Temp@hotmail.com',
            Contrasena: 'minmin123',
            Telefono: '8123454522',
            Es_Admin: false,
            Esta_Activo: false
        });

        res.status(201).json({ 
            message: "Usuario Registrado!",
            userId: newUser._id 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};