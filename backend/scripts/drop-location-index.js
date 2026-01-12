// Script to drop the location_2dsphere index from the observations collection
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function dropLocationIndex() {
  try {
    // Connect to local test database
    await mongoose.connect('mongodb://localhost:27017/phenom_test');
    console.log('Connected to MongoDB');

    const coll = mongoose.connection.collection('observations');
    const indexes = await coll.listIndexes().toArray();
    
    console.log('Current indexes:');
    indexes.forEach(idx => console.log('  -', idx.name));
    
    // Find and drop any location-related index
    for (const idx of indexes) {
      if (idx.name && idx.name.includes('location') && idx.name.includes('2dsphere')) {
        console.log(`Dropping index: ${idx.name}`);
        await coll.dropIndex(idx.name);
        console.log('Dropped!');
      }
    }
    
    console.log('Done!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

dropLocationIndex();
