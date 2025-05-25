import asyncHandler from 'express-async-handler'; // A simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.
import {User} from '../models/User.js'
import generateToken from '../utils/jwt.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400); // Bad request
        throw new Error('User already exists with this email');
    }

    // Create user
    const user = await User.create({
        username,
        email,
        password, // Password will be hashed by pre-save hook in User model
        role: role || 'user', // Default to 'user' if role is not provided
    });

    if (user) {
        res.status(201).json({ // 201 means Created
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role), // Generate token for the new user
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    // Check if user exists AND password matches
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error('Invalid email or password');
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (requires token)
export const getMe = asyncHandler(async (req, res) => {
    // req.user is set by the protect middleware
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
    });
});
