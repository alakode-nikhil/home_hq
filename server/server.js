import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'; // Import user routes
import errorHandlers  from './middlewares/errorMiddleware.js'; // Import error middlewares

// Load environment variables
config({ path: './.env' });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON and enable CORS
app.use(json()); // Allows us to send JSON in request bodies
app.use(cors());

// Basic route (can be removed later)
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount User Routes
app.use('/api/auth', userRoutes); // All user-related routes will start with /api/auth

// Error Handling Middleware (must be *after* all routes)
app.use(errorHandlers.notFound); // Handles 404 Not Found errors
app.use(errorHandlers.errorHandler); // Handles all other errors

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});