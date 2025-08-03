// src/pages/InstructorDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    price: 0,
    thumbnail: null,
    video: null
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCourseId, setUploadCourseId] = useState(null);
  const [uploadType, setUploadType] = useState('content'); // 'content', 'thumbnail', 'video'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalRevenue: 0,
    totalStudents: 0
  });
  const [enrollmentData, setEnrollmentData] = useState({});
  const [showEnrollments, setShowEnrollments] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchEnrollmentData();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      console.log('Courses API response:', res.data);
      console.log('Response type:', typeof res.data);
      
      // Handle different response structures
      let coursesData = [];
      if (Array.isArray(res.data)) {
        coursesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        coursesData = res.data.data;
      } else if (res.data && typeof res.data === 'object') {
        // If it's an object, try to extract courses
        coursesData = Object.values(res.data).filter(item => item && typeof item === 'object');
      }
      
      console.log('Processed courses data:', coursesData);
      
      // Filter courses by this instructor
      const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
      console.log('Current user ID:', currentUserId);
      
      const instructorCourses = coursesData.filter(c => 
        c && c.instructor && 
        (c.instructor._id === currentUserId || c.instructor === currentUserId)
      );
      
      console.log('Instructor courses found:', instructorCourses.length);
      setCourses(instructorCourses);
      
      // Calculate stats
      const totalRevenue = instructorCourses.reduce((sum, course) => sum + (parseFloat(course.price) || 0), 0);
      const totalStudents = instructorCourses.reduce((sum, course) => sum + (course.enrollments?.length || 0), 0);
      
      setStats({
        totalCourses: instructorCourses.length,
        totalRevenue: totalRevenue,
        totalStudents: totalStudents
      });
    } catch (err) {
      console.error('Error fetching courses:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentData = async () => {
    try {
      console.log('Fetching enrollment data...');
      const res = await api.get('/enroll/instructor');
      console.log('Enrollment API response:', res.data);
      console.log('Response type:', typeof res.data);
      console.log('Response keys:', Object.keys(res.data || {}));
      
      setEnrollmentData(res.data || {});
      
      // Update stats with accurate enrollment data
      const totalStudents = Object.values(res.data || {}).reduce((sum, courseData) => sum + (courseData?.totalStudents || 0), 0);
      console.log('Total students calculated:', totalStudents);
      setStats(prev => ({ ...prev, totalStudents }));
      
      // Also try to get all enrollments as fallback
      console.log('Attempting fallback enrollment fetch...');
      const allEnrollments = await api.get('/enroll');
      console.log('All enrollments response:', allEnrollments.data);
      
    } catch (err) {
      console.error('Error fetching enrollment data:', err);
      console.error('Error details:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Try alternative approach - get all enrollments and filter
      try {
        console.log('Trying alternative approach...');
        const allEnrollments = await api.get('/enroll');
        console.log('Alternative enrollments:', allEnrollments.data);
      } catch (altErr) {
        console.error('Alternative approach also failed:', altErr);
      }
    }
  };

  const handleNewCourseChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setNewCourse({ ...newCourse, [field]: file });
    }
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newCourse.title);
      formData.append('description', newCourse.description);
      formData.append('category', newCourse.category);
      formData.append('price', newCourse.price);
      
      if (newCourse.thumbnail) {
        formData.append('thumbnail', newCourse.thumbnail);
      }
      
      if (newCourse.video) {
        formData.append('video', newCourse.video);
      }

      await api.post('/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Course created successfully!');
      setNewCourse({ title: '', description: '', category: '', price: 0, thumbnail: null, video: null });
      fetchCourses();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleUploadFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const uploadContent = async () => {
    if (!uploadCourseId || !uploadFile) {
      setMessage('Select a course and file to upload.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadFile.name);
      formData.append('type', uploadType);

      await api.post(`/courses/${uploadCourseId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('File uploaded successfully.');
      setUploadFile(null);
      fetchCourses();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your courses and track your teaching success</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Enrollment Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Student Enrollments</h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchEnrollmentData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => setShowEnrollments(!showEnrollments)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                {showEnrollments ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Hide Details
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Show Details
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Debug:</strong> Enrollment data keys: {Object.keys(enrollmentData).length} | 
                Data: {JSON.stringify(Object.keys(enrollmentData))}
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <strong>Courses:</strong> {courses.length} courses found
              </p>
              <p className="text-sm text-yellow-800 mt-1">
                <strong>User ID:</strong> {JSON.parse(localStorage.getItem('user') || '{}')?.id || 'Not found'}
              </p>
            </div>
          )}

          {/* Course Enrollment Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {Object.entries(enrollmentData).map(([courseId, data]) => (
              <div key={courseId} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{data.course.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Students Enrolled:</span>
                  <span className="text-lg font-bold text-blue-600">{data.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm text-gray-800">{data.course.category}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Price:</span>
                  <span className="text-sm font-medium text-green-600">${data.course.price}</span>
                </div>
              </div>
            ))}
          </div>

          {Object.keys(enrollmentData).length === 0 && (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled Yet</h3>
              <p className="text-gray-600">Create and publish courses to start getting student enrollments.</p>
            </div>
          )}

          {/* Detailed Student Information */}
          {showEnrollments && Object.keys(enrollmentData).length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-t pt-6">Detailed Student Information</h3>
              {Object.entries(enrollmentData).map(([courseId, data]) => (
                <div key={courseId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4">
                    <h4 className="text-lg font-medium text-gray-900">{data.course.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{data.totalStudents} students enrolled</p>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {data.enrollments.map((enrollment) => (
                      <div key={enrollment._id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {enrollment.student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{enrollment.student.name}</p>
                            <p className="text-sm text-gray-500">{enrollment.student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Progress</p>
                            <div className="flex items-center mt-1">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{enrollment.progress}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Enrolled</p>
                            <p className="text-sm text-gray-500">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              enrollment.paymentStatus === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {enrollment.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Course Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Course</h2>
          <form onSubmit={createCourse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <input 
                  id="title"
                  name="title" 
                  placeholder="Enter course title" 
                  value={newCourse.title} 
                  onChange={handleNewCourseChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input 
                  id="category"
                  name="category" 
                  placeholder="e.g., Programming, Design, Business" 
                  value={newCourse.category} 
                  onChange={handleNewCourseChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input 
                  id="price"
                  name="price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={newCourse.price} 
                  onChange={handleNewCourseChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
                  Course Thumbnail
                </label>
                <input 
                  id="thumbnail"
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 1280x720px, JPG/PNG</p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea 
                id="description"
                name="description" 
                placeholder="Describe your course content and what students will learn" 
                value={newCourse.description} 
                onChange={handleNewCourseChange} 
                required 
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
              />
            </div>

            <div>
              <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                Course Introduction Video
              </label>
              <input 
                id="video"
                type="file" 
                accept="video/*"
                onChange={(e) => handleFileChange(e, 'video')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: MP4, WebM, or MOV format</p>
            </div>

            <div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Course
              </button>
            </div>
          </form>
        </div>

        {/* Your Courses Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
          
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses created yet</h3>
              <p className="text-gray-600">Start by creating your first course above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {courses.map(course => (
                <div key={course._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{course.category}</p>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">${(course.price || 0).toFixed(2)}</span>
                        <span className="text-sm text-gray-500">
                          {course.enrollments?.length || 0} students
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/course/${course._id}`}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center text-sm font-medium"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Content Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Course Content</h2>
          
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Create a course first to upload content</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <select 
                  id="course-select"
                  onChange={e => setUploadCourseId(e.target.value)} 
                  defaultValue=""
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all duration-200"
                >
                  <option value="" disabled>Choose a course</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="upload-type" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Type
                </label>
                <select 
                  id="upload-type"
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white transition-all duration-200"
                >
                  <option value="content">Course Content (PDF, DOC, etc.)</option>
                  <option value="thumbnail">Course Thumbnail (Image)</option>
                  <option value="video">Course Video</option>
                </select>
              </div>

              <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <input 
                  id="file-upload"
                  type="file" 
                  onChange={handleUploadFileChange}
                  accept={
                    uploadType === 'thumbnail' ? 'image/*' : 
                    uploadType === 'video' ? 'video/*' : 
                    '.pdf,.doc,.docx,.txt,.ppt,.pptx'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadType === 'thumbnail' ? 'Accepted: JPG, PNG, GIF' :
                   uploadType === 'video' ? 'Accepted: MP4, WebM, MOV' :
                   'Accepted: PDF, DOC, DOCX, TXT, PPT, PPTX'}
                </p>
              </div>

              <button 
                onClick={uploadContent}
                disabled={!uploadCourseId || !uploadFile}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Upload {uploadType === 'thumbnail' ? 'Thumbnail' : uploadType === 'video' ? 'Video' : 'Content'}
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        {message && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructorDashboard;
