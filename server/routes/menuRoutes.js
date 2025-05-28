// my-web-app/server/routes/menuRoutes.js

import { Router } from 'express';
import { getMenus, createMenu, updateMenu, deleteMenu } from '../controllers/menuController.js'; // Import menu controller functions

import { protect } from '../middlewares/authMiddleware.js'; // Import authentication middleware
import { authorizeRoles } from '../middlewares/rbacMiddleware.js'; // Import RBAC middleware

// Create an Express router instance
const router = Router();

// -------------------------------------------------------------------
// Public Route (Accessible to all users, authenticated or not)
// -------------------------------------------------------------------

// GET /api/menus
// Fetches a list of all menus. This is public because the navigation structure
// typically needs to be visible to all users.
router.get('/', getMenus);

// -------------------------------------------------------------------
// Private/Admin-Only Routes (Requires authentication and 'admin' role)
// -------------------------------------------------------------------

// POST /api/menus
// Creates a new menu. Only an authenticated 'admin' user can perform this action.
// - `protect`: Ensures the user is authenticated (has a valid token).
// - `authorizeRoles('admin')`: Ensures the authenticated user has the 'admin' role.
router.post('/', protect, authorizeRoles('admin'), createMenu);

// PUT /api/menus/:id
// Updates an existing menu by its MongoDB _id. Only an authenticated 'admin' user can perform this action.
// The ':id' is a URL parameter that will be available in req.params.id in the controller.
router.put('/:id', protect, authorizeRoles('admin'), updateMenu);

// DELETE /api/menus/:id
// Deletes an existing menu by its MongoDB _id. Only an authenticated 'admin' user can perform this action.
router.delete('/:id', protect, authorizeRoles('admin'), deleteMenu);

// Export the router to be used in server.js
export default router;