// src/pages/Signup.jsx
import React, { useState } from 'react';
import { signup } from '../services/auth';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} value={form.name} required autoComplete="name" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} value={form.email} required autoComplete="username" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} value={form.password} required autoComplete="new-password" />
        <select name="role" onChange={handleChange} value={form.role}>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
        </select>
        <button type="submit">Signup</button>
        {error && <p style={{color:'red'}}>{error}</p>}
      </form>
    </div>
  );
}

export default Signup;
