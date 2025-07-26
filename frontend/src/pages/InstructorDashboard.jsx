// src/pages/InstructorDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', category: '', price: 0 });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCourseId, setUploadCourseId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      // filter courses by this instructor if backend doesn't have an endpoint for instructor courses
      // or implement backend API to filter by instructor
      // Here assuming backend returns all, and we don't filter client-side:
      setCourses(res.data.filter(c => c.instructor?._id === JSON.parse(localStorage.getItem('user'))?.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewCourseChange = (e) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const createCourse = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', newCourse);
      setMessage('Course created');
      setNewCourse({ title: '', description: '', category: '', price: 0 });
      fetchCourses();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create course');
    }
  };

  const handleFileChange = (e) => {
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

      await api.post(`/courses/${uploadCourseId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('File uploaded successfully.');
      // Optional: refresh course list to show new content
      fetchCourses();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload failed');
    }
  };

  return (
    <div>
      <h2>Instructor Dashboard</h2>
      <form onSubmit={createCourse}>
        <input name="title" placeholder="Title" value={newCourse.title} onChange={handleNewCourseChange} required />
        <input name="description" placeholder="Description" value={newCourse.description} onChange={handleNewCourseChange} required />
        <input name="category" placeholder="Category" value={newCourse.category} onChange={handleNewCourseChange} required />
        <input name="price" type="number" min="0" step="0.01" value={newCourse.price} onChange={handleNewCourseChange} required />
        <button type="submit">Create Course</button>
      </form>

      <hr />

      <h3>Your Courses</h3>
      <ul>
        {courses.map(course => (
          <li key={course._id}>
            {course.title} - {course.category} - ${course.price.toFixed(2)}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Upload Course Content</h3>
      <select onChange={e => setUploadCourseId(e.target.value)} defaultValue="">
        <option value="" disabled>Select Course</option>
        {courses.map(course => (
          <option key={course._id} value={course._id}>
            {course.title}
          </option>
        ))}
      </select>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadContent}>Upload Content</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default InstructorDashboard;
