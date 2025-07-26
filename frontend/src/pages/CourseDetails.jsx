// src/pages/CourseDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
// import StripePayment from '../components/StripePayment';
import { useAuth } from '../contexts/AuthContext';

function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) return <p>Loading...</p>;

  const handleEnrollClick = () => {
    if (!user || user.role !== 'student') {
      setMessage('Please login as a student to enroll.');
      return;
    }
    setShowPayment(true);
  };

  // After successful payment (can be passed down or handled inside StripePayment component), you may want to:
  //  - Reload user enrollments
  //  - Redirect to student dashboard or course content

  return (
    <div>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <p><b>Category:</b> {course.category}</p>
      <p><b>Price:</b> ${course.price}</p>
      <button onClick={handleEnrollClick}>Buy / Enroll</button>
      {message && <p style={{color:'red'}}>{message}</p>}

      {showPayment && (
        // <StripePayment courseId={course._id} amount={course.price} />
        <p>Stripe payment is currently disabled.</p>
      )}
    </div>
  );
}

export default CourseDetails;
