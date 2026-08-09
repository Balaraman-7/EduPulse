import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminFaculty from './pages/AdminFaculty';
import DepartmentManagement from './pages/DepartmentManagement';
import DepartmentDetail from './pages/DepartmentDetail';
import ClassDetail from './pages/ClassDetail';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentInterventionDetail from './pages/StudentInterventionDetail';
import StudentDashboard from './pages/StudentDashboard';
import StudentAICounsellor from './pages/StudentAICounsellor';
import Reports from './pages/Reports';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Verifying session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Loading EduPulse...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin & Department Hierarchy Routes */}
      <Route path="/admin/dashboard" element={<ProtectedLayout allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedLayout>} />
      <Route path="/admin/departments" element={<ProtectedLayout allowedRoles={['ADMIN', 'FACULTY']}><DepartmentManagement /></ProtectedLayout>} />
      <Route path="/admin/departments/:id" element={<ProtectedLayout allowedRoles={['ADMIN', 'FACULTY']}><DepartmentDetail /></ProtectedLayout>} />
      <Route path="/admin/classes/:id" element={<ProtectedLayout allowedRoles={['ADMIN', 'FACULTY']}><ClassDetail /></ProtectedLayout>} />

      <Route path="/admin/students" element={<ProtectedLayout allowedRoles={['ADMIN']}><AdminStudents /></ProtectedLayout>} />
      <Route path="/admin/faculty" element={<ProtectedLayout allowedRoles={['ADMIN']}><AdminFaculty /></ProtectedLayout>} />
      <Route path="/admin/reports" element={<ProtectedLayout allowedRoles={['ADMIN']}><Reports /></ProtectedLayout>} />

      {/* Faculty Routes */}
      <Route path="/faculty/dashboard" element={<ProtectedLayout allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedLayout>} />
      <Route path="/faculty/students" element={<ProtectedLayout allowedRoles={['FACULTY']}><AdminStudents /></ProtectedLayout>} />
      <Route path="/faculty/alerts" element={<ProtectedLayout allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedLayout>} />
      <Route path="/faculty/reports" element={<ProtectedLayout allowedRoles={['FACULTY']}><Reports /></ProtectedLayout>} />

      {/* Student Detail View */}
      <Route path="/student-detail/:id" element={<ProtectedLayout allowedRoles={['ADMIN', 'FACULTY']}><StudentInterventionDetail /></ProtectedLayout>} />

      {/* Student Subsystem Routes */}
      <Route path="/student/dashboard" element={<ProtectedLayout allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedLayout>} />
      <Route path="/student/academic" element={<ProtectedLayout allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedLayout>} />
      <Route path="/student/chatbot" element={<ProtectedLayout allowedRoles={['STUDENT']}><StudentAICounsellor /></ProtectedLayout>} />

      {/* Fallback */}
      <Route path="*" element={
        user ? (
          user.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
          user.role === 'FACULTY' ? <Navigate to="/faculty/dashboard" replace /> :
          <Navigate to="/student/dashboard" replace />
        ) : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}
