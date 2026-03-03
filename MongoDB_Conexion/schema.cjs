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