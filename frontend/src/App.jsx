import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseDetails from './pages/CourseDetails';
import PrivateRoute from "./utils/PrivateRoutes";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  return (
    // Add your Navbar here
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/dashboard/instructor" element={
        <PrivateRoute allowedRoles={['instructor']}><InstructorDashboard /></PrivateRoute>
      } />
      <Route path="/dashboard/student" element={
        <PrivateRoute allowedRoles={['student']}><StudentDashboard /></PrivateRoute>
      } />
      <Route path="/course/:id" element={<CourseDetails />} />
    </Routes>
  );
}
export default App;
