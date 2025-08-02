const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload'); // multer instance
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// Create course with thumbnail and video
router.post('/', auth(['instructor', 'admin']), upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const instructor = req.user.id;

    const courseData = {
      title,
      description,
      category,
      price: parseFloat(price),
      instructor
    };

    // Handle thumbnail upload
    if (req.files && req.files.thumbnail) {
      const thumbnail = req.files.thumbnail[0];
      courseData.thumbnail = {
        filename: thumbnail.filename,
        originalName: thumbnail.originalname,
        mimetype: thumbnail.mimetype,
        size: thumbnail.size,
        url: `/uploads/${thumbnail.filename}`
      };
    }

    // Handle video upload
    if (req.files && req.files.video) {
      const video = req.files.video[0];
      courseData.video = {
        filename: video.filename,
        originalName: video.originalname,
        mimetype: video.mimetype,
        size: video.size,
        url: `/uploads/${video.filename}`
      };
    }

    const course = new Course(courseData);
    await course.save();

    res.status(201).json({ 
      message: 'Course created successfully', 
      course: {
        ...course.toObject(),
        thumbnail: courseData.thumbnail,
        video: courseData.video
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get course with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.json({
      data: courses,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', courseController.getCourseById);
router.put('/:id', auth(['instructor', 'admin']), courseController.updateCourse);
router.delete('/:id', auth(['instructor', 'admin']), courseController.deleteCourse);

// Upload course content, thumbnail, or video
router.post('/:courseId/upload', auth(['instructor', 'admin']),
  upload.single('file'),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin')
        return res.status(403).json({ error: 'Access denied' });

      const { type } = req.body; // 'content', 'thumbnail', 'video'
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileData = {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        type: type || 'content'
      };

      // Handle different upload types
      if (type === 'thumbnail') {
        course.thumbnail = fileData;
      } else if (type === 'video') {
        course.video = fileData;
      } else {
        // Add to content array
        course.content.push({
          title: req.body.title || file.originalname,
          ...fileData
        });
      }

      await course.save();

      res.status(201).json({ 
        message: `${type || 'Content'} uploaded successfully`, 
        file: fileData 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
