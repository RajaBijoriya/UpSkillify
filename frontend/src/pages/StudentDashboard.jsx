// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enroll');
      setEnrollments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateProgress = async (enrollmentId, progress) => {
    try {
      await api.put(`/enroll/${enrollmentId}/progress`, { progress });
      fetchEnrollments();
    } catch (err) {
      console.error(err);
    }
  };

  const unenroll = async (enrollmentId) => {
    try {
      await api.delete(`/enroll/${enrollmentId}`);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      <h3>Your Enrollments</h3>
      <ul>
        {enrollments.map(({ _id, course, progress }) => (
          <li key={_id}>
            <b>{course.title}</b> - Progress: {progress}%
            <br />
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={e => updateProgress(_id, parseInt(e.target.value))}
            />
            <br />
            <button onClick={() => unenroll(_id)}>Unenroll</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentDashboard;
