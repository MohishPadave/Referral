import mongoose from 'mongoose';
import { env } from '../config/env';

export async function connectMongo(): Promise<void> {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI missing - please set this environment variable');
  }

  try {
    console.log('Attempting MongoDB connection...');
    
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000, // Reduced timeout
      socketTimeoutMS: 30000, // Reduced timeout
      maxPoolSize: 5, // Reduced pool size
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
    });

    console.log('MongoDB connection established successfully');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    console.error('Connection string format check:', env.mongoUri.substring(0, 20) + '...');
    throw error;
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}


