import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "testtest_clave";

export const Token_Verificar = (req, res, next) => {
    //Conseguir Token de Header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "No hay token." });
    }

    try {
        //Verificar Token
        const verificado = jwt.verify(token, JWT_SECRET);
        req.user = verificado; 
        next(); //Pasar a la siguiente Funcion en Controller
    } catch (error) {
        res.status(403).json({ message: "Token no válido o expirado." });
    }
};