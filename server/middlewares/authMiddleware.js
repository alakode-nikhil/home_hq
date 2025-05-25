import jwt  from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import {User}  from '../models/User.js';

const {verify} = jwt;

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check if the Authorization header is present and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]; // Format: "Bearer TOKEN"

            // Verify token
            const decoded = verify(token, process.env.JWT_SECRET);

            // Attach user to the request object (excluding password)
            // We find the user by ID and attach it, so later controllers can use req.user
            req.user = await User.findById(decoded.id).select('-password');
            // req.user.role will also be available for RBAC

            next(); // Move to the next middleware or route handler
        } catch (error) {
            console.error(error);
            res.status(401); // Unauthorized
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});
