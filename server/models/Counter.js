import { Schema, model } from 'mongoose';

const counterSchema = Schema({
    _id: { type: String, required: true }, // The name of the sequence (e.g., 'menuId')
    seq: { type: Number, default: 0 },   // The current sequence value
});

export const Counter = model('Counter', counterSchema);

