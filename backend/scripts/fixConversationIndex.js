const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');

async function fixConversationIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agrilink');
    console.log('Connected to MongoDB');

    // Drop the existing index
    await Conversation.collection.dropIndex('participants_1');
    console.log('Dropped existing index');

    // Create a new compound index
    await Conversation.collection.createIndex(
      { participants: 1 },
      { 
        unique: true,
        collation: { locale: 'simple', strength: 2 }
      }
    );
    console.log('Created new index');

    console.log('Index fix completed successfully');
  } catch (error) {
    console.error('Error fixing index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixConversationIndex(); 