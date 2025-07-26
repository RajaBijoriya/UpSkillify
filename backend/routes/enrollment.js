const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { auth } = require('../middleware/auth');

// Enroll in a course (only student role)
router.post('/:courseId', auth(['student']), enrollmentController.enrollInCourse);

// Get all enrollments of current user (student, instructor, admin)
router.get('/', auth(['student', 'instructor', 'admin']), enrollmentController.getUserEnrollments);


// Update progress of enrollment
router.put('/:enrollmentId/progress', auth(['student']), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    if (enrollment.user.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const { progress } = req.body; // Expect progress as number 0 - 100
    enrollment.progress = Math.min(100, Math.max(0, progress)); // clamp between 0 and 100
    await enrollment.save();
    res.json({ message: 'Progress updated', enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Unenroll from course
router.delete('/:enrollmentId', auth(['student']), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    if (enrollment.user.toString() !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    await enrollment.remove();
    res.json({ message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
