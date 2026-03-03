import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';

const app = express();

// MIDDLEWARE: Essential for reading JSON from the request body
app.use(express.json());

// ROUTES: Connect the auth routes
app.use('/api/auth', authRoutes);

// DATABASE CONNECTION
mongoose.connect('mongodb://localhost:27017/Ink_Reserve')
    .then(() => {
        app.listen(3000, () => console.log("🚀 Server running on port 3000"));
    })
    .catch(err => console.error("Connection error", err));