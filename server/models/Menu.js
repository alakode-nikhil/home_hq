import { Schema, model } from 'mongoose';
import { Counter } from './Counter.js'; // Import the Counter model

const menuSchema = Schema(
    {
        menuId: { // Our custom auto-incrementing ID
            type: Number,
            unique: true,
        },
        name: {
            type: String,
            required: [true, 'Please add a menu name'],
            // Removed unique: true constraint from here
            trim: true,
        },
        order: {
            type: Number,
            default: 0, // For custom ordering of menus
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save hook to generate auto-incrementing menuId
menuSchema.pre('save', async function (next) {
    if (this.isNew) { // Only generate for new documents
        const counter = await Counter.findByIdAndUpdate(
            { _id: 'menuId' }, // The name of our counter
            { $inc: { seq: 1 } }, // Increment the sequence by 1
            { new: true, upsert: true } // Return the new document, create if it doesn't exist
        );
        this.menuId = counter.seq;
    }
    next();
});

export const Menu = model('Menu', menuSchema);
