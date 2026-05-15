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

// Solo permite el acceso si el usuario autenticado es admin.
// Debe usarse SIEMPRE después de Token_Verificar.
export const Admin_Only = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "No autenticado." });
    }
    if (!req.user.Es_Admin) {
        return res.status(403).json({ message: "Acceso denegado: se requieren permisos de administrador." });
    }
    next();
};