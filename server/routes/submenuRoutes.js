// my-web-app/server/routes/submenuRoutes.js

import { Router } from 'express';
import { getSubmenus, createSubmenu, updateSubmenu, deleteSubmenu, getSubmenuById } from '../controllers/submenuController.js';

import { protect } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();

// -------------------------------------------------------------------
// Public Routes (Accessible to all users, authenticated or not)
// -------------------------------------------------------------------

// GET /api/submenus?parentId=<ID>&parentModel=<TYPE>
// Fetches a list of submenus. Now requires both parentId and parentModel query params.
router.get('/', getSubmenus);

// GET /api/submenus/:id
// Fetches a single submenu by its MongoDB _id.
router.get('/:id', getSubmenuById); // <--- Add this new route!

// -------------------------------------------------------------------
// Private/Admin-Only Routes (Requires authentication and 'admin' role)
// -------------------------------------------------------------------

// POST /api/submenus
// Creates a new submenu.
router.post('/', protect, authorizeRoles('admin'), createSubmenu);

// PUT /api/submenus/:id
// Updates an existing submenu.
router.put('/:id', protect, authorizeRoles('admin'), updateSubmenu);

// DELETE /api/submenus/:id
// Deletes an existing submenu.
router.delete('/:id', protect, authorizeRoles('admin'), deleteSubmenu);

// Export the router
export default router;