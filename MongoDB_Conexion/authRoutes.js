import express from 'express';
import { Registrar_Usuario } from './authController.js';
import { Login_Usuario } from './authController.js';
import { Token_Verificar } from './authMiddleware.js'

const router = express.Router();

// This maps a POST request to our function
router.post('/register', Registrar_Usuario);
router.post('/login', Login_Usuario);

router.get('/perfil', Token_Verificar, (req, res) => {
    res.json({ message: "Login exitoso, bienvenido", user: req.user });
});




export default router;