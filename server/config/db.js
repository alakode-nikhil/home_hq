import { connect } from 'mongoose';

const connectDB = async () => {
    try {
        // Ensure MONGO_URI is loaded from .env
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables.');
        }

        const conn = await connect(process.env.MONGO_URI, {
            //useNewUrlParser: true,      // Deprecated, but good for older versions
            //useUnifiedTopology: true,   // Recommended for stable connections
            // useCreateIndex: true,    // Deprecated in Mongoose 6+
            // useFindAndModify: false  // Deprecated in Mongoose 6+
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

export default connectDB;