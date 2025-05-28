import asyncHandler from 'express-async-handler';
import { Menu } from '../models/Menu.js';

// @desc    Get all menus
// @route   GET /api/menus
// @access  Public (Anyone can see the menu structure)
export const getMenus = asyncHandler(async (req, res) => {
    const menus = await Menu.find({}).sort('order'); // Sort by the 'order' field

    res.status(200).json(menus);
});

// @desc    Create a new menu
// @route   POST /api/menus
// @access  Private/Admin
export const createMenu = asyncHandler(async (req, res) => {
    const { name, order } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Please add a menu name');
    }

    // --- CHANGE IMPLEMENTED HERE: Implement 10 Menu Limit ---
    // Count the total number of existing menu documents in the database
    const menuCount = await Menu.countDocuments();
    // If the current count is already 10 or more, prevent creation
    if (menuCount >= 10) {
        res.status(400); // Bad request status code
        throw new Error('Maximum of 10 menus allowed. Cannot create more.');
    }
    // --- END CHANGE ---

    // --- CHANGE IMPLEMENTED HERE: Name uniqueness check IS REMOVED ---
    // As per your request, menu names are no longer unique.
    // So, the following commented-out block is intentionally absent:
    // const menuExists = await Menu.findOne({ name });
    // if (menuExists) {
    //     res.status(400);
    //     throw new Error('Menu with this name already exists');
    // }
    // --- END CHANGE ---

    const menu = await Menu.create({
        name,
        order: order !== undefined ? order : 0, // Use provided order or default to 0
    });

    // The auto-incrementing `menuId` is handled by the `pre('save')` hook in the Menu model
    // and will be automatically assigned to the 'menu' object before it's saved.

    res.status(201).json(menu); // 201 Created status, respond with the new menu object
});

// In server/controllers/menuController.js

// @desc    Get a single menu by ID
// @route   GET /api/menus/:id
// @access  Public (Needed for displaying parent menu name)
export const getMenuById = asyncHandler(async (req, res) => {
    // Find the menu by its MongoDB ObjectId (_id)
    const menu = await Menu.findById(req.params.id);

    if (!menu) {
        // If no menu is found with the given ID, send a 404 Not Found error
        res.status(404);
        throw new Error('Menu not found');
    }

    // If the menu is found, send it back with a 200 OK status
    res.status(200).json(menu);
});

// @desc    Update a menu
// @route   PUT /api/menus/:id
// @access  Private/Admin
export const updateMenu = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the MongoDB ObjectId from the URL parameter
    const { name, order } = req.body; // Get new name and order from request body

    const menu = await Menu.findById(id); // Find the menu by its MongoDB ObjectId

    if (!menu) {
        res.status(404); // Not Found status
        throw new Error('Menu not found');
    }

    // --- CHANGE IMPLEMENTED HERE: No uniqueness check on name during update ---
    // If the name is being changed, there's no need to check for existing duplicates
    // because names are no longer unique across menus.
    // --- END CHANGE ---

    // Update fields if they are provided in the request body
    menu.name = name || menu.name;
    menu.order = order !== undefined ? order : menu.order;

    const updatedMenu = await menu.save(); // Save the updated menu document

    res.status(200).json(updatedMenu); // 200 OK status, respond with the updated menu object
});

// @desc    Delete a menu
// @route   DELETE /api/menus/:id
// @access  Private/Admin
export const deleteMenu = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the MongoDB ObjectId from the URL parameter

    const menu = await Menu.findById(id); // Find the menu by its MongoDB ObjectId

    if (!menu) {
        res.status(404); // Not Found status
        throw new Error('Menu not found');
    }

    // Delete the menu document from the database
    await menu.deleteOne();

    res.status(200).json({ message: 'Menu removed' }); // 200 OK status, respond with success message
});
