//Para probar archivo, la ruta es *node ./MongoDB_Conexion/schema.cjs*

const mongoose = require('mongoose');

const ConnectToMongoDB = async () => {
    try {
        const url = 'mongodb://localhost:27017/Ink_Reserve'; 
        
        await mongoose.connect(url);
        
        console.log("✅ Conexion con MongoDB exitosa");
    }
    catch (err) {
        console.error("❌ Conexion con MongoDB Fallida, Error:", err.message);
    }
};

ConnectToMongoDB();

const Usuario_Schema = new mongoose.Schema({
    Nombre_Completo: {
        type: String,
        required: [true, 'Usuario debe tener nombre'],
        minlenght: 5

    },
    Correo_Electronico: {
        type: String,
        required: [true, 'Usuario debe tener Correo'],
        unique: true,
        lowercase: true

    },
    Contrasena:{
        type: String, //guardada como hash
        required: [true, 'Usuario debe tener Contrasena'],
        minlenght: 5

    },
    Telefono:{
        type: String,
        minlenght: 10

    },
    Es_Admin:{
        type: Boolean, //False-Usuario, True-Admin
        default: false

    },
    Esta_Activo:{
        type: Boolean, //False-Inactivo, True-Activo
        default: true

    },
    Fecha_Registro:{
        type: Date,
        default: Date.now

    },
    Ultima_Actualizacion:{
        type: Date,
        default: Date.now

    }

});



const Cliente_Schema = new mongoose.Schema({
    Nombre: {
        type: String,
        required: [true, 'Cliente debe tener nombre'],
        minlenght: 5

    },
    Fecha_Nacimiento:{
        type: Date

    },
    Notas_Importantes:{
        type: String, //alergias, piel, sensible, etc
        default: 'Ninguna'

    },
    Preferencias:{
        type: String, //estilos, zonas del cuerpo, etc
        default: 'Ninguna'

    },
    Citas_Anteriores:{
        type: Number,
        default: 0
    
    },
    Total_Gastado:{
        type: Number,
        default: 0
    
    }
});



const Tatuador_Schema = new mongoose.Schema({
    Nombre: {
        type: String,
        required: [true, 'Cliente debe tener nombre'],
        minlenght: 5

    },
    Especialidades: {
        type: String,
        default: 'Ninguna' //blackwork,tradicional, fine line, etc

    },
    Anos_De_Experiencia:{
        type: Number,
        default: 0

    },
    Horario_Dias: {
        type: String,
        default: 'Lunes a Viernes'

    },
    Horario_Horas: {
        type: String,
        default: '10am a 6pm'

    },
    Esta_Disponible: {
        type: Boolean,
        default: false

    }
});





const Categoria_Schema = new mongoose.Schema({
    Titulo: {
        type: String,
        required: true

    }
});



const Cita_Schema = new mongoose.Schema({
    Cliente_Asociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true

    },

    Tatuador_Asociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tatuador',
        required: true

    },

    Categoria_Asociada: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },

    Fecha_y_Hora: {
        type: Date
    },

    Duracion_Estimada:{
        type: Number,
        default: 20 //En Minutos
    },

    Estado_Cita:{
        type: Number,
        default: 0 //0-Pendiente, 1-Confirmada, 2-Completa, 3-Cancelada, 4-No Asistio
    },

    Anticipo:{
        type: Number, //Monto en Pesos
    },

    Metodo_Anticipo: {
        type: Number,
        default: 0 //0-Efectivo, 1-Transferencia, 2-Referencia
    },

    Nota_Del_Cliente: {
        type: String,
        default: 'Sin comentarios' //idea, zona del cuerpo, referencia

    },

    Fecha_Creacion: {
        type: Date,
        default: Date.now

    },

    Fecha_ultima_Modificacion: {
        type: Date,
        default: Date.now

    }
});



const Foto_Tatuaje_Schema = new mongoose.Schema({
    Cita_Asociada: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cita',
        required: true

    },
    Archivo_Imagen: {
        type: String,
        required: true
    },
    Descripcion: {
        type: String,
        required: true
    }
});




const Venta_Schema = new mongoose.Schema({
    Cita_Asociada: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cita',
        required: true

    },

    Cliente_Asociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true

    },

    Tatuador_Asociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tatuador',
        required: true

    },
    Descripcion_Servicio: {
        type: String,
        default: 'Sin comentarios'
    },

    Realizado: {
        type: Boolean,
        required: true,
        default: true

    },

    Precio: {
        type: Number, //En Pesos
        required: true
    },

    Anticipo_Aplicado: {
        type: Number
    },

    Total_Pagado: {
        type: Number //En Pesos
    },

    Estado_Pago:{
        type: Number, //0-Pagado, 1-Pendiente, 2-Reembolsado
        default: 1
    },

    Fecha_Pago:{
        type: Date,
        default: Date.now
    }

    
});



const Usuario = mongoose.model('Usuario', Usuario_Schema);
const Cliente = mongoose.model('Cliente', Cliente_Schema);
const Tatuador = mongoose.model('Tatuador', Tatuador_Schema);
const Categoria = mongoose.model('Categoria', Categoria_Schema);
const Cita = mongoose.model('Cita', Cita_Schema);
const Foto_Tatuaje = mongoose.model('Foto_Tatuaje', Foto_Tatuaje_Schema);
const Venta = mongoose.model('Venta', Venta_Schema);


module.exports = {Usuario, Cliente,Tatuador,Categoria,Cita,Foto_Tatuaje,Venta};