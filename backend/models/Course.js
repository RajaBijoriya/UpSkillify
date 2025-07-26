const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  rating: { type: Number, default: 0 },
  price: Number,
  content: [
    {
      title: String,
      url: String // URL or filepath of uploaded file
    }
  ],
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
