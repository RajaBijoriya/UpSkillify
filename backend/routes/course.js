const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload'); // multer instance
const Course = require('../models/Course');


router.post('/', auth(['instructor', 'admin']), courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);
router.put('/:id', auth(['instructor', 'admin']), courseController.updateCourse);
router.delete('/:id', auth(['instructor', 'admin']), courseController.deleteCourse);


// Upload course content media
router.post('/:courseId/upload', auth(['instructor', 'admin']),
  upload.single('file'), // Field in form-data is name='file'
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.courseId);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin')
        return res.status(403).json({ error: 'Access denied' });

      // Add uploaded file info to course.content
      const newContent = {
        title: req.body.title || req.file.originalname,
        url: req.file.path // or construct full URL if hosting static files
      };
      course.content.push(newContent);
      await course.save();

      res.status(201).json({ message: 'File uploaded and added to course', content: newContent });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /api/courses?category=Programming&minPrice=10&maxPrice=100&search=js&page=1&limit=10
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

module.exports = router;
