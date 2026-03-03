import express from 'express';
import { Registrar_Usuario } from './authController.js';
import { Login_Usuario } from './authController.js';

const router = express.Router();

// This maps a POST request to our function
router.post('/register', Registrar_Usuario);
router.post('/login', Login_Usuario);

export default router;