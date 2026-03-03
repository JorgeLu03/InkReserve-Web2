import mongoose from 'mongoose';
import { Categoria } from './schema.js';
import { Usuario } from './schema.js';

const ConnectToMongoDB = async () => {
  
    try {
        const url = 'mongodb://localhost:27017/Ink_Reserve'; 
    
        await mongoose.connect(url);
    
        console.log("✅ Conexion con MongoDB exitosa");
    } catch (err) {
        console.error("❌ Conexion con MongoDB Fallida, Error:", err.message);
    }



    
    //Definir Modelo al que se va a insertar
    //import { Categoria } from './schema.js';


    
    //Comprobar, si esto da {} o "undefined" Entonces Modelo no se exportó bien
    console.log("¿Que Modelo se Importo?:", Categoria);

    
    //Insertar a Categoria
    const new_Categoria = await Categoria.create({
        Titulo: 'Banda de Rock'
    });

    //Comprobar qué se insertó
    console.log("Salio bien!, ID:", new_Categoria._id);
    

    const new_Usuario = await Usuario.create({
        Nombre_Completo: 'Admin manuel',
        Correo_Electronico: 'manuel@hotmail.com',
        Contrasena: 'minmin123',
        Telefono: '8123454522',
        Es_Admin: true,
        Esta_Activo: true
        
    });

    console.log("Salio bien!, ID:", new_Usuario._id);

    
    

    







    await mongoose.disconnect();

};

ConnectToMongoDB();