import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
    if (!uri) {
      console.error('MONGODB_URI is not set. Please add it to your .env file.');
      process.exit(1);
    }

    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.error('Invalid MongoDB URI scheme. It must start with "mongodb://" or "mongodb+srv://".');
      console.error('Current value:', uri);
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      family: 4, // Force IPv4 (fixes 'localhost' resolution issues in Node 18+)
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    console.log('MongoDB connected:', conn.connection.host);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
