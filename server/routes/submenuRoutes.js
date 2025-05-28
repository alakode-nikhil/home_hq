// my-web-app/server/routes/submenuRoutes.js

import { Router } from 'express';
import { getSubmenus, createSubmenu, updateSubmenu, deleteSubmenu } from '../controllers/submenuController.js'; // Import submenu controller functions

import { protect } from '../middlewares/authMiddleware.js'; // Import authentication middleware
import { authorizeRoles } from '../middlewares/rbacMiddleware.js'; // Import RBAC middleware

// Create an Express router instance
const router = Router();

// -------------------------------------------------------------------
// Public Route (Accessible to all users, authenticated or not)
// -------------------------------------------------------------------

// GET /api/submenus
// Fetches a list of all submenus. Can also accept a 'menuId' query parameter
// (e.g., /api/submenus?menuId=abc123def456) to filter submenus for a specific parent menu.
// This is public because content links typically need to be visible to all users.
router.get('/', getSubmenus);

// -------------------------------------------------------------------
// Private/Admin-Only Routes (Requires authentication and 'admin' role)
// -------------------------------------------------------------------

// POST /api/submenus
// Creates a new submenu. Only an authenticated 'admin' user can perform this action.
router.post('/', protect, authorizeRoles('admin'), createSubmenu);

// PUT /api/submenus/:id
// Updates an existing submenu by its MongoDB _id. Only an authenticated 'admin' user can perform this action.
router.put('/:id', protect, authorizeRoles('admin'), updateSubmenu);

// DELETE /api/submenus/:id
// Deletes an existing submenu by its MongoDB _id. Only an authenticated 'admin' user can perform this action.
router.delete('/:id', protect, authorizeRoles('admin'), deleteSubmenu);

// Export the router to be used in server.js
export default router;