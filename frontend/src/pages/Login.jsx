// src/pages/Login.jsx
import React, { useState } from 'react';
import { login } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const { login: setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);
      setAuthUser(user);

      if (user.role === 'student') {
        navigate('/dashboard/student');
      } else if (user.role === 'instructor') {
        navigate('/dashboard/instructor');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} value={form.email} required autoComplete="username" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} value={form.password} required autoComplete="current-password" />
        <button type="submit">Login</button>
        {error && <p style={{color:'red'}}>{error}</p>}
      </form>
      <p>
        <a href="/forgot-password">Forgot Password?</a>
      </p>
    </div>
  );
}

export default Login;
