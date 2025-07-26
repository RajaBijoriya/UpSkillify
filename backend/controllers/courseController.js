const Course = require('../models/Course.js');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const course = new Course({ ...req.body, instructor: req.user.id });
    await course.save();
    res.status(201).json(course);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  const courses = await Course.find().populate('instructor', 'name email');
  res.json(courses);
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name');
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
};

// Update a course
exports.updateCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied' });
  Object.assign(course, req.body);
  await course.save();
  res.json(course);
};

// Delete a course
exports.deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Access denied' });
  await course.remove();
  res.json({ message: 'Course deleted' });
};
