import { Schema, model } from 'mongoose';

const submenuSchema = Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a submenu name'],
            trim: true,
        },
        menuId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Menu',
        },
        templateType: {
            type: String,
            required: [true, 'Please select a template type'],
            enum: ['grid', 'gallery', 'table', 'submenu'],
        },
        order: {
            type: Number,
            default: 0,
        },
        contentItems: { // New field for content data (e.g., file paths)
            type: Array, // Can store an array of objects
            default: [],
            // This field will only be relevant for 'grid', 'gallery', 'table' template types
            // We'll manage its usage in the controller.
        },
        // If templateType is 'submenu', you might want to add a 'parentSubmenuId' for nested submenus
        // For now, we'll keep it flat, but this is a future consideration.
        // parentSubmenuId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Submenu',
        //     default: null,
        // },
    },
    {
        timestamps: true,
    }
);

export const Submenu = model('Submenu', submenuSchema);
