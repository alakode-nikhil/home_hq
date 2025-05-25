import { Schema, model } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs'; // For password hashing

const userSchema = Schema(
    {
        username: {
            type: String,
            required: [true, 'Please add a username'],
            trim: true, // Removes whitespace from both ends of a string
            minlength: 3,
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            trim: true,
            lowercase: true, // Stores emails in lowercase
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ], // Basic email regex validation
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['admin', 'user', 'guest'], // Define allowed roles
            default: 'user', // Default role for new users
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
    }
);

// --- Mongoose Middleware (Pre-save Hook) ---
// Hash password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        // Only hash if the password field is new or has been modified
        next();
    }

    const salt = await genSalt(10); // Generate a salt (random string)
    this.password = await hash(this.password, salt); // Hash the password with the salt
    next();
});

// --- Mongoose Methods (for User instance) ---
// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await compare(enteredPassword, this.password);
};

export const User = model('User', userSchema);
