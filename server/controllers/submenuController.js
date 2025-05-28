// my-web-app/server/controllers/submenuController.js
import asyncHandler from 'express-async-handler';
import { Submenu } from '../models/Submenu.js';
import { Menu } from '../models/Menu.js'; // Still needed to find Menu parents
import { Types } from 'mongoose'; // For ObjectId validation

// Utility function to validate parent existence and apply 5-child limit
export const validateParentAndLimit = async (parentId, parentModel, currentSubmenuId = null) => {
    // Validate parentId format
    if (!Types.ObjectId.isValid(parentId)) {
        const error = new Error('Invalid Parent ID format.');
        error.statusCode = 400; // Custom property for error handling
        throw error;
    }

    let parentDocument;
    if (parentModel === 'Menu') {
        parentDocument = await Menu.findById(parentId);
    } else if (parentModel === 'Submenu') {
        parentDocument = await Submenu.findById(parentId);
    } else {
        const error = new Error('Invalid parentModel type. Must be "Menu" or "Submenu".');
        error.statusCode = 400;
        throw error;
    }

    if (!parentDocument) {
        const error = new Error(`${parentModel} parent not found with the provided ID.`);
        error.statusCode = 404;
        throw error;
    }

    // Apply 5-child limit
    // Count submenus that have this parentId and parentModel
    let query = { parentId: parentId, parentModel: parentModel };
    if (currentSubmenuId) {
        // When updating, exclude the current submenu itself from the count
        query._id = { $ne: currentSubmenuId };
    }
    const submenusCount = await Submenu.countDocuments(query);

    if (submenusCount >= 5) {
        const error = new Error(`Maximum of 5 submenus allowed for this <span class="math-inline">\{parentModel\.toLowerCase\(\)\} parent "</span>{parentDocument.name}". Cannot create more.`);
        error.statusCode = 400;
        throw error;
    }

    return parentDocument; // Return the parent document for reference (e.g., its name)
};

// @desc    Get submenus based on parent
// @route   GET /api/submenus?parentId=<ID>&parentModel=<TYPE>
// @access  Public
export const getSubmenus = asyncHandler(async (req, res) => {
    const { parentId, parentModel } = req.query; // Get parentId and parentModel from query parameters

    // --- ADD THESE CONSOLE.LOGS ---
    console.log('Backend: getSubmenus received:');
    console.log('  Query parentId:', parentId);
    console.log('  Query parentModel:', parentModel);
    console.log('  Is parentId a valid ObjectId?', Types.ObjectId.isValid(parentId));
    console.log('  Is parentModel "Menu" or "Submenu"?', ['Menu', 'Submenu'].includes(parentModel));
    // --- END CONSOLE.LOGS ---

    let query = {};
    if (parentId && parentModel) {
        if (!Types.ObjectId.isValid(parentId)) {
            res.status(400);
            throw new Error('Invalid Parent ID format provided.');
        }
        if (!['Menu', 'Submenu'].includes(parentModel)) {
            res.status(400);
            throw new Error('Invalid Parent Model type. Must be "Menu" or "Submenu".');
        }
        query.parentId = parentId;
        query.parentModel = parentModel;
    } else if (parentId || parentModel) { // If only one is provided
        res.status(400);
        throw new Error('Both parentId and parentModel must be provided for filtered submenus.');
    }

    const submenus = await Submenu.find(query).sort('order');

    res.status(200).json(submenus);
});

// @desc    Create a new submenu
// @route   POST /api/submenus
// @access  Private/Admin
export const createSubmenu = asyncHandler(async (req, res) => {
    const { name, parentId, parentModel, templateType, order, contentItems } = req.body;

    if (!name || !parentId || !parentModel || !templateType) {
        res.status(400);
        throw new Error('Please include all required fields: name, parentId, parentModel, templateType');
    }

    // Validate parent and apply 5-child limit
    try {
        await validateParentAndLimit(parentId, parentModel);
    } catch (error) {
        res.status(error.statusCode || 500); // Use custom status code if available
        throw new Error(error.message);
    }

    const submenuData = {
        name,
        parentId,
        parentModel,
        templateType,
        order: order !== undefined ? order : 0,
    };

    // Handle contentItems based on templateType, as before
    if (templateType !== 'submenu' && contentItems !== undefined) {
        if (!Array.isArray(contentItems)) {
            res.status(400);
            throw new Error('Content items must be an array.');
        }
        submenuData.contentItems = contentItems;
    } else if (templateType === 'submenu') {
        submenuData.contentItems = []; // Ensure no content for 'submenu' type
    }

    const submenu = await Submenu.create(submenuData);

    res.status(201).json(submenu);
});

// @desc    Update a submenu
// @route   PUT /api/submenus/:id
// @access  Private/Admin
export const updateSubmenu = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, parentId, parentModel, templateType, order, contentItems } = req.body;

    const submenu = await Submenu.findById(id);

    if (!submenu) {
        res.status(404);
        throw new Error('Submenu not found');
    }

    // Check for parent change and apply limit if changed
    if (parentId && parentModel) {
        const isParentChanged = submenu.parentId.toString() !== parentId.toString() || submenu.parentModel !== parentModel;

        if (isParentChanged) {
            try {
                // Pass currentSubmenuId to exclude it from the count for the new parent
                await validateParentAndLimit(parentId, parentModel, submenu._id);
            } catch (error) {
                res.status(error.statusCode || 500);
                throw new Error(error.message);
            }
            submenu.parentId = parentId;
            submenu.parentModel = parentModel;
        }
    } else if (parentId || parentModel) { // If only one of parentId/parentModel is provided in update
        res.status(400);
        throw new Error('Both parentId and parentModel must be provided if changing parent.');
    }


    submenu.name = name || submenu.name;
    submenu.order = order !== undefined ? order : submenu.order;

    // Handle templateType and contentItems
    const effectiveTemplateType = templateType || submenu.templateType; // Use new or existing templateType

    if (effectiveTemplateType !== 'submenu') {
        if (contentItems !== undefined) {
            if (!Array.isArray(contentItems)) {
                res.status(400);
                throw new Error('Content items must be an array.');
            }
            submenu.contentItems = contentItems;
        }
    } else {
        // If the template type IS 'submenu' (or being changed to 'submenu'), clear contentItems
        submenu.contentItems = [];
    }

    // Update templateType itself
    if (templateType !== undefined) {
        submenu.templateType = templateType;
    }

    const updatedSubmenu = await submenu.save();

    res.status(200).json(updatedSubmenu);
});

// @desc    Delete a submenu
// @route   DELETE /api/submenus/:id
// @access  Private/Admin
export const deleteSubmenu = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const submenu = await Submenu.findById(id);

    if (!submenu) {
        res.status(404);
        throw new Error('Submenu not found');
    }

    // IMPORTANT: If deleting a submenu that has children (templateType: 'submenu' and has sub-submenus),
    // you might want to consider:
    // 1. Preventing deletion if it has children.
    // 2. Deleting all its children (cascading delete).
    // 3. Re-parenting its children.
    // For simplicity, we are currently not handling cascading deletion or prevention.
    // The frontend should ideally prompt the user about potential orphaned sub-submenus.

    await submenu.deleteOne();

    res.status(200).json({ message: 'Submenu removed' });
});


// @desc    Get a single submenu by ID
// @route   GET /api/submenus/:id
// @access  Public (Can be used by frontend for editing or displaying standalone content)
export const getSubmenuById = asyncHandler(async (req, res) => {
    const submenu = await Submenu.findById(req.params.id);

    if (!submenu) {
        res.status(404);
        throw new Error('Submenu not found');
    }

    res.status(200).json(submenu);
});

