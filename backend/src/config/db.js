import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if DNS set is restricted
}

import mongoose from 'mongoose';

export const connectDB = async () => {
  // Check if connection is already established (Crucial for Vercel Serverless Function reuse)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const primaryUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/edupulse';
  const isCloudTarget = primaryUri.includes('mongodb+srv') || primaryUri.includes('mongodb.net');

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 8000
    });

    console.log('\n======================================================');
    if (isCloudTarget) {
      console.log('  🌐 DATABASE MODE: CONNECTED TO MONGODB ATLAS CLOUD   ');
      console.log(`  Cluster Host: ${conn.connection.host}`);
      console.log(`  Database Name: ${conn.connection.name}`);
    } else {
      console.log('  🏠 DATABASE MODE: CONNECTED TO LOCAL MONGODB         ');
      console.log(`  Host: ${conn.connection.host}:${conn.connection.port}`);
      console.log(`  Database Name: ${conn.connection.name}`);
    }
    console.log('======================================================\n');
    return conn;
  } catch (error) {
    if (isCloudTarget && process.env.NODE_ENV !== 'production') {
      console.warn('\n======================================================');
      console.warn('  ⚠️ CLOUD ATLAS CONNECTION FAILED (College / ISP Firewall Block)');
      console.warn(`  Attempting fallback connection to Local MongoDB...`);
      console.warn('======================================================\n');

      try {
        const localUri = 'mongodb://localhost:27017/edupulse';
        const fallbackConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 5000
        });
        console.log('\n======================================================');
        console.log('  🏠 DATABASE MODE: CONNECTED TO LOCAL MONGODB (FALLBACK)');
        console.log(`  Host: ${fallbackConn.connection.host}:${fallbackConn.connection.port}`);
        console.log(`  Database Name: ${fallbackConn.connection.name}`);
        console.log('======================================================\n');
        return fallbackConn;
      } catch (fallbackError) {
        console.error('[MongoDB Error]: Could not connect to Cloud Atlas or Local MongoDB.', fallbackError.message);
        throw fallbackError;
      }
    } else {
      console.error('[MongoDB Error]: Connection failed.', error.message);
      throw error;
    }
  }
};
