import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; // Import the database connection function

// Load environment variables from .env file
config({ path: './.env' }); // Explicitly specify path if .env is in server folder

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(json());
app.use(cors());

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});