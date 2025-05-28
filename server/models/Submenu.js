// my-web-app/server/models/Submenu.js
import { Schema, model } from 'mongoose';

// Define the schema for our Submenu model
const submenuSchema = Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a submenu name'],
            trim: true,
        },
        // NEW: Parent ID - can reference either a Menu or another Submenu
        // Mongoose's `ref` property enforces a specific model type.
        // When dealing with dynamic references (polymorphic associations),
        // you typically omit `ref` here and enforce the type in the controller logic
        // based on `parentModel` field.
        parentId: {
            type: Schema.Types.ObjectId,
            required: true,
            // No 'ref' here because it's dynamic. We'll use parentModel field.
        },
        // NEW: Parent Model Type - indicates whether parentId refers to 'Menu' or 'Submenu'
        parentModel: {
            type: String,
            required: true,
            enum: ['Menu', 'Submenu'], // Must be 'Menu' or 'Submenu'
        },
        templateType: {
            type: String,
            required: true,
            enum: ['grid', 'gallery', 'table', 'submenu'],
            default: 'submenu', // Good default as it can itself have children
        },
        order: {
            type: Number,
            default: 0,
        },
        contentItems: {
            type: Array, // Stores any arbitrary content related to this submenu
            default: [],
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create the Mongoose model from the schema
export const Submenu = model('Submenu', submenuSchema);
