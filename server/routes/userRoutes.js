import { Router } from 'express';
import {registerUser, loginUser, getMe} from '../controllers/userController.js';
import {protect}  from '../middlewares/authMiddleware.js';
import {authorizeRoles}  from '../middlewares/rbacMiddleware.js';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
// getMe is protected, so only logged-in users can access it.
router.get('/me', protect, getMe);

// Admin-only routes (Example: User management)
// This route would typically be for an admin to view all users
// For this example, we'll put it here. Later, we'll create an admin-specific route file.
// Example: An admin could list all users
router.get('/admin/users', protect, authorizeRoles('admin'), (req, res) => {
    // In a real app, you'd fetch users from DB here via a controller
    res.send('This is a protected admin route to get all users!');
});

export default router;