// src/pages/BrowseCourses.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function BrowseCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ search: '', category: '', min: 0, max: 500 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [enrollingCourses, setEnrollingCourses] = useState(new Set());
  const [message, setMessage] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        ...filters,
        page,
        limit: 10,
      }).toString();

      console.log('Fetching courses with params:', queryParams);
      const res = await api.get(`/courses?${queryParams}`);
      console.log('API response:', res.data);
      
      // Handle different response structures
      if (res.data.data) {
        console.log('Using res.data.data structure');
        setCourses(res.data.data);
        setTotalPages(res.data.totalPages || 1);
      } else if (Array.isArray(res.data)) {
        console.log('Using direct array structure');
        setCourses(res.data);
        setTotalPages(1);
      } else {
        console.log('No valid data structure found');
        setCourses([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load courses. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEnrollments = async () => {
    if (!user || user.role !== 'student') return;
    
    try {
      const res = await api.get('/enroll');
      const enrolledIds = new Set(res.data.map(enrollment => enrollment.course._id));
      setEnrolledCourses(enrolledIds);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    }
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      setMessage('Please login to enroll in courses.');
      return;
    }
    
    if (user.role !== 'student') {
      setMessage('Only students can enroll in courses.');
      return;
    }

    if (enrolledCourses.has(courseId)) {
      setMessage('You are already enrolled in this course.');
      return;
    }

    setEnrollingCourses(prev => new Set([...prev, courseId]));
    
    try {
      await api.post(`/enroll/${courseId}`);
      setEnrolledCourses(prev => new Set([...prev, courseId]));
      setMessage('Successfully enrolled in the course!');
    } catch (err) {
      console.error('Enrollment error:', err);
      setMessage(err.response?.data?.error || 'Failed to enroll in course.');
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page]);

  useEffect(() => {
    fetchUserEnrollments();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <section className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
              <p className="text-gray-600 mt-2">Discover thousands of courses from top instructors</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Course</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search courses..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input 
              placeholder="Category" 
              value={filters.category}
              onChange={e => setFilters({ ...filters, category: e.target.value })} 
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input 
              type="number" 
              placeholder="Min Price"
              value={filters.min}
              onChange={e => setFilters({ ...filters, min: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number" 
              placeholder="Max Price"
              value={filters.max}
              onChange={e => setFilters({ ...filters, max: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button 
              onClick={fetchCourses}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setMessage('')}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Courses Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">All Courses</h2>
          
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                  <button 
                    onClick={fetchCourses}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
              <p className="text-gray-600 mb-6">Be the first to create a course!</p>
              <Link
                to="/dashboard/instructor"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Create Your First Course
              </Link>
            </div>
          )}

          {/* Courses Grid */}
          {!loading && !error && courses.length > 0 && (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                Found {courses.length} courses
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => {
                  console.log('Rendering course:', course);
                  const isEnrolled = enrolledCourses.has(course._id);
                  const isEnrolling = enrollingCourses.has(course._id);
                  
                  return (
                    <div key={course._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                      {/* Course Thumbnail */}
                      {course.thumbnail ? (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={`http://localhost:5000${course.thumbnail.url}`}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">{course.title?.charAt(0) || 'C'}</span>
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {course.title || 'Untitled Course'}
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {course.category || 'General'}
                          </span>
                          <span className="text-2xl font-bold text-green-600">
                            ${(course.price || 0).toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2 mb-4">
                          <Link
                            to={`/course/${course._id}`}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium text-center text-sm"
                          >
                            View Details
                          </Link>
                          
                          {user && user.role === 'student' && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleEnroll(course._id);
                              }}
                              disabled={isEnrolled || isEnrolling}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                                isEnrolled
                                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                  : isEnrolling
                                  ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                              }`}
                            >
                              {isEnrolled ? (
                                <span className="flex items-center justify-center">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Enrolled
                                </span>
                              ) : isEnrolling ? (
                                <span className="flex items-center justify-center">
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Enrolling...
                                </span>
                              ) : (
                                'Enroll Now'
                              )}
                            </button>
                          )}
                          
                          {(!user || user.role !== 'student') && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleEnroll(course._id);
                              }}
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page >= totalPages} 
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default BrowseCourses; 