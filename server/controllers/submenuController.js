import asyncHandler from 'express-async-handler';
import { Submenu } from '../models/Submenu.js';
import { Menu } from '../models/Menu.js'; // Imported to check if parent menu exists
import { Types } from 'mongoose'; // Imported for ObjectId validation (e.g., isValid)

// @desc    Get all submenus or submenus for a specific menu
// @route   GET /api/submenus?menuId=<ID>
// @access  Public (Anyone can see the submenu structure)
export const getSubmenus = asyncHandler(async (req, res) => {
    const { menuId } = req.query; // Get menuId from query parameters (e.g., ?menuId=60f...)

    let query = {};
    if (menuId) {
        // Validate that the provided menuId is a valid MongoDB ObjectId format
        if (!Types.ObjectId.isValid(menuId)) {
            res.status(400); // Bad request status
            throw new Error('Invalid Menu ID format provided in query parameter.');
        }
        query.menuId = menuId; // Filter submenus by this menuId
    }

    const submenus = await Submenu.find(query).sort('order'); // Find and sort by 'order'

    res.status(200).json(submenus); // Respond with the found submenus
});

// @desc    Create a new submenu
// @route   POST /api/submenus
// @access  Private/Admin
export const createSubmenu = asyncHandler(async (req, res) => {
    const { name, menuId, templateType, order, contentItems } = req.body; // contentItems is now accepted

    // Basic validation for required fields
    if (!name || !menuId || !templateType) {
        res.status(400);
        throw new Error('Please include all required fields: name, menuId, templateType');
    }

    // Validate menuId format (ensure it's a valid MongoDB ObjectId string)
    if (!Types.ObjectId.isValid(menuId)) {
        res.status(400);
        throw new Error('Invalid Menu ID format.');
    }

    // Check if the parent menu actually exists in the database
    const parentMenu = await Menu.findById(menuId);
    if (!parentMenu) {
        res.status(404); // Not Found status
        throw new Error('Parent menu not found with the provided ID.');
    }

    // --- CHANGE IMPLEMENTED HERE: Implement 5 Submenu Limit per Menu ---
    // Count existing submenus specifically for this parent menuId
    const submenusCount = await Submenu.countDocuments({ menuId });
    // If the count is 5 or more, prevent creation
    if (submenusCount >= 5) {
        res.status(400); // Bad request status
        throw new Error(`Maximum of 5 submenus allowed for menu "${parentMenu.name}". Cannot create more.`);
    }
    // --- END CHANGE ---

    // Prepare the data for the new submenu
    const submenuData = {
        name,
        menuId,
        templateType,
        order: order !== undefined ? order : 0, // Use provided order or default
    };

    // --- CHANGE IMPLEMENTED HERE: Handle contentItems based on templateType ---
    // If the templateType is NOT 'submenu' (i.e., 'grid', 'gallery', 'table')
    // AND contentItems were provided in the request body, then add them.
    if (templateType !== 'submenu' && contentItems !== undefined) {
        if (!Array.isArray(contentItems)) { // Basic type check for contentItems
            res.status(400);
            throw new Error('Content items must be an array.');
        }
        submenuData.contentItems = contentItems;
    }
    // Optional: You could add a warning/error here if contentItems are provided for 'submenu' type,
    // but the current logic simply ignores them for 'submenu' types.
    // else if (templateType === 'submenu' && contentItems !== undefined && contentItems.length > 0) {
    //     console.warn(`Warning: contentItems provided for 'submenu' type. They will be ignored.`);
    // }
    // --- END CHANGE ---

    const submenu = await Submenu.create(submenuData); // Create the new submenu document

    res.status(201).json(submenu); // 201 Created status, respond with the new submenu object
});

// @desc    Update a submenu
// @route   PUT /api/submenus/:id
// @access  Private/Admin
export const updateSubmenu = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the MongoDB ObjectId of the submenu to update
    const { name, menuId, templateType, order, contentItems } = req.body; // contentItems is now accepted

    const submenu = await Submenu.findById(id); // Find the submenu by its MongoDB ObjectId

    if (!submenu) {
        res.status(404); // Not Found status
        throw new Error('Submenu not found');
    }

    // If a new menuId is provided and it's different from the current one
    if (menuId && menuId !== submenu.menuId.toString()) {
        if (!Types.ObjectId.isValid(menuId)) {
            res.status(400);
            throw new Error('Invalid Menu ID format.');
        }
        const parentMenu = await Menu.findById(menuId);
        if (!parentMenu) {
            res.status(404);
            throw new Error('New parent menu not found.');
        }
        // --- CHANGE IMPLEMENTED HERE: Re-check 5 Submenu Limit if changing parent menu ---
        // If we are moving this submenu to a different parent menu,
        // we must check if the *new* parent menu already has 5 submenus.
        const submenusCount = await Submenu.countDocuments({ menuId });
        if (submenusCount >= 5) {
            res.status(400);
            throw new Error(`Maximum of 5 submenus allowed for new parent menu "${parentMenu.name}". Cannot move submenu.`);
        }
        // --- END CHANGE ---
        submenu.menuId = menuId; // Update the parent menu reference
    }

    // Update basic fields if provided in the request body
    submenu.name = name || submenu.name;
    submenu.templateType = templateType || submenu.templateType;
    submenu.order = order !== undefined ? order : submenu.order;

    // --- CHANGE IMPLEMENTED HERE: Handle contentItems update based on templateType ---
    // Determine the effective template type (new one if provided, else existing)
    const effectiveTemplateType = templateType || submenu.templateType;

    if (effectiveTemplateType !== 'submenu') {
        // If the template type is not 'submenu', allow updating contentItems
        if (contentItems !== undefined) {
            if (!Array.isArray(contentItems)) {
                res.status(400);
                throw new Error('Content items must be an array.');
            }
            submenu.contentItems = contentItems;
        }
    } else {
        // If the template type IS 'submenu' (or being changed to 'submenu'):
        // If contentItems are provided in the body (and it's a 'submenu' type), warn/ignore.
        if (contentItems !== undefined && contentItems.length > 0) {
             console.warn(`Warning: contentItems provided for 'submenu' type during update. They will be ignored.`);
        }
        // IMPORTANT: If changing to 'submenu' type, ensure contentItems are cleared.
        // This prevents old content from 'grid'/'gallery'/'table' from persisting.
        if(templateType === 'submenu' && submenu.templateType !== 'submenu'){
            submenu.contentItems = []; // Explicitly clear contentItems if type changes to 'submenu'
        }
    }
    // --- END CHANGE ---

    const updatedSubmenu = await submenu.save(); // Save the updated submenu document

    res.status(200).json(updatedSubmenu); // 200 OK status, respond with updated submenu object
});

// @desc    Delete a submenu
// @route   DELETE /api/submenus/:id
// @access  Private/Admin
export const deleteSubmenu = asyncHandler(async (req, res) => {
    const { id } = req.params; // Get the MongoDB ObjectId of the submenu to delete

    const submenu = await Submenu.findById(id); // Find the submenu by its MongoDB ObjectId

    if (!submenu) {
        res.status(404); // Not Found status
        throw new Error('Submenu not found');
    }

    // Delete the submenu document from the database
    await submenu.deleteOne();

    res.status(200).json({ message: 'Submenu removed' }); // 200 OK status, respond with success message
});
