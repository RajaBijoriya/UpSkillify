const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// Enroll in a course
exports.enrollInCourse = async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  // Check if user is already enrolled
  const already = await Enrollment.findOne({ user: req.user.id, course: course._id });
  if (already) return res.status(400).json({ error: 'Already enrolled' });
  const enrollment = new Enrollment({
    user: req.user.id,
    course: course._id,
    progress: 0,
    paymentStatus: 'paid' // Change to 'pending' if you add payment flow
  });
  await enrollment.save();
  res.status(201).json(enrollment);
};

// Get all enrollments for a user
exports.getUserEnrollments = async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user.id }).populate('course');
  res.json(enrollments);
};
