// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc'}}>
      <Link to="/">Home</Link>
      {!user && (<><Link to="/login">Login</Link><Link to="/signup">Signup</Link></>)}
      {user?.role === 'student' && <Link to="/dashboard/student">Student Dashboard</Link>}
      {user?.role === 'instructor' && <Link to="/dashboard/instructor">Instructor Dashboard</Link>}
      {user && <button onClick={handleLogout}>Logout</button>}
    </nav>
  );
}

export default Navbar;
