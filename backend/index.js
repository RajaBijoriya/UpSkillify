const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const paymentRoutes = require('./routes/payment');
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // your frontend dev server
  credentials: true, // if you use cookies or sessions
}));
app.use(express.json());

// MongoDB connection with fallback to local database
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/upskillify';
console.log('Attempting to connect to MongoDB:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

mongoose.connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('Database:', mongoose.connection.name);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 To fix this issue:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Or create a .env file with MONGO_URI=your_mongodb_connection_string');
    console.log('3. Or use MongoDB Atlas: https://cloud.mongodb.com/');
    process.exit(1);
  });

// Import routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/enroll', require('./routes/enrollment'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Add payment routes similarly
app.use('/api/payment', require('./middleware/auth').auth(['student']), paymentRoutes);

app.get('/', (req, res) => res.send('UpSkillify API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
