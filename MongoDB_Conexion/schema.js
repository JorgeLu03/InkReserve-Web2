// Schemas de Mongoose — la conexión la maneja server.js

import mongoose from 'mongoose';

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
    // ── Referencias MongoDB (opcionales para compatibilidad con frontend) ──
    Cliente_Asociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
    },
    Tatuador_Asociado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tatuador',
    },
    Categoria_Asociada: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
    },

    // ── Campos del frontend ──
    clientName:     { type: String, default: '' },
    clientInitials: { type: String, default: '' },
    clientColor:    { type: String, default: '#c084fc' },
    artistId:       { type: Number },          // id numérico del artista mock
    date:           { type: String },          // "YYYY-MM-DD"
    time:           { type: String },          // "HH:MM"
    hours:          { type: Number, default: 1 },
    style:          { type: String, default: '' },
    dimensions:     { type: String, default: '—' },
    total_precio:   { type: Number, default: 0 },
    tattooKey:      { type: String, default: 'rose' },
    // status string: pending | confirmed | in_progress | completed | cancelled
    status:         { type: String, default: 'pending' },
    cancellationFee:{ type: Number, default: 0 },
    refImages:      { type: Array,  default: [] },

    // ── Campos originales ──
    Fecha_y_Hora: { type: Date },

    Duracion_Estimada: {
        type: Number,
        default: 60, // En Minutos
    },

    Estado_Cita: {
        type: Number,
        default: 0, // 0-Pendiente,1-Confirmada,2-En progreso,3-Completa,4-Cancelada
    },

    Anticipo:        { type: Number },
    Metodo_Anticipo: { type: Number, default: 0 },

    Nota_Del_Cliente: {
        type: String,
        default: 'Sin comentarios',
    },

    Fecha_Creacion:            { type: Date, default: Date.now },
    Fecha_ultima_Modificacion: { type: Date, default: Date.now },
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



export const Usuario = mongoose.model('Usuario', Usuario_Schema);
export const Cliente = mongoose.model('Cliente', Cliente_Schema);
export const Tatuador = mongoose.model('Tatuador', Tatuador_Schema);
export const Categoria = mongoose.model('Categoria', Categoria_Schema);
export const Cita = mongoose.model('Cita', Cita_Schema);
export const Foto_Tatuaje = mongoose.model('Foto_Tatuaje', Foto_Tatuaje_Schema);
export const Venta = mongoose.model('Venta', Venta_Schema);

//module.exports = {Usuario, Cliente,Tatuador,Categoria,Cita,Foto_Tatuaje,Venta};