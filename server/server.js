import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'; // Import user routes
import menuRoutes from './routes/menuRoutes.js';
import submenuRoutes from './routes/submenuRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';  // Import error middlewares

// Load environment variables
config({ path: './.env' });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON and enable CORS
app.use(express.json()); // Allows us to send JSON in request bodies
app.use(cors());

// Basic route (can be removed later)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount User Routes
app.use('/api/auth', userRoutes);// All user-related routes will start with /api/auth

// Mount Menu routes
// All routes defined in menuRoutes (e.g., /, /:id)
// will be prefixed with '/api/menus'.
// So, getting all menus will be http://localhost:5000/api/menus
app.use('/api/menus', menuRoutes);

// Mount Submenu routes
// All routes defined in submenuRoutes (e.g., /, /:id)
// will be prefixed with '/api/submenus'.
// So, getting all submenus will be http://localhost:5000/api/submenus
app.use('/api/submenus', submenuRoutes);

// Error Handling Middleware (must be *after* all routes)
app.use(notFound); // Handles 404 Not Found errors
app.use(errorHandler); // Handles all other errors

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});