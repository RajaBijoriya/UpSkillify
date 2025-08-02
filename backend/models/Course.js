const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  rating: { type: Number, default: 0 },
  price: Number,
  thumbnail: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  },
  video: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  },
  content: [
    {
      title: String,
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String,
      type: { type: String, enum: ['content', 'thumbnail', 'video'], default: 'content' }
    }
  ],
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
