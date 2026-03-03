import { Usuario } from './schema.js';
import jwt from 'jsonwebtoken';
const JWT_SECRET = "testtest_clave";

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

export const Login_Usuario = async (req, res) => {
    try {
        const { Correo_Electronico, Contrasena } = req.body;

        
        
        const Usuario_Existe_Correo = await Usuario.findOne({ Correo_Electronico });
        
        
        

        //Checar si usuario Existe
        if (Usuario_Existe_Correo) {
            //return res.status(201).json({ message: "Usuario si existe!"});

            const Usuario_Existe_Contrasena = await Usuario.findOne({ Contrasena });

            if (Usuario_Existe_Contrasena) {
                


                //Token
                const token = jwt.sign(
                    { id: Usuario_Existe_Contrasena._id, Es_Admin: Usuario_Existe_Contrasena.Es_Admin,
                        Nombre_Completo:Usuario_Existe_Contrasena.Nombre_Completo,
                        Correo_Electronico:Usuario_Existe_Contrasena.Correo_Electronico,
                        Contrasena:Usuario_Existe_Contrasena.Contrasena,
                        Telefono:Usuario_Existe_Contrasena.Telefono
                    }, 
                    JWT_SECRET, 
                    { expiresIn: '1h' }
                );

                res.json({ token });


                return res.status(201).json({ message: "Usuario si existe, Login exitoso"});
            }
            else{
                return res.status(400).json({ message: "Usuario si existe, contrasena equivocada!"});
            }



        }
        else{
            return res.status(400).json({ message: "Usuario no existe!"});
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};