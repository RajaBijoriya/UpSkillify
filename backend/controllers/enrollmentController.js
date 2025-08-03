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

// Get all enrollments for instructor's courses
exports.getInstructorEnrollments = async (req, res) => {
  try {
    console.log('Getting enrollments for instructor:', req.user.id);
    
    // First, get all courses by this instructor
    const instructorCourses = await Course.find({ instructor: req.user.id });
    console.log('Instructor courses found:', instructorCourses.length);
    
    if (instructorCourses.length === 0) {
      console.log('No courses found for instructor');
      return res.json({});
    }
    
    const courseIds = instructorCourses.map(course => course._id);
    console.log('Course IDs:', courseIds);
    
    // Then get all enrollments for these courses with student info
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('user', 'name email')
      .populate('course', 'title category price');
    
    console.log('Enrollments found:', enrollments.length);
    
    // Group enrollments by course
    const enrollmentsByCourse = {};
    enrollments.forEach(enrollment => {
      const courseId = enrollment.course._id.toString();
      if (!enrollmentsByCourse[courseId]) {
        enrollmentsByCourse[courseId] = {
          course: enrollment.course,
          enrollments: [],
          totalStudents: 0
        };
      }
      enrollmentsByCourse[courseId].enrollments.push({
        _id: enrollment._id,
        student: enrollment.user,
        progress: enrollment.progress,
        enrolledAt: enrollment.createdAt,
        paymentStatus: enrollment.paymentStatus
      });
      enrollmentsByCourse[courseId].totalStudents++;
    });
    
    console.log('Grouped enrollments:', Object.keys(enrollmentsByCourse));
    res.json(enrollmentsByCourse);
  } catch (err) {
    console.error('Error in getInstructorEnrollments:', err);
    res.status(500).json({ error: err.message });
  }
};
