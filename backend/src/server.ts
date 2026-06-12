import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { testConnection } from './config/database';

const PORT = parseInt(process.env.PORT || '5000');

async function start(): Promise<void> {
  try {
    await testConnection();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
