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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

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
