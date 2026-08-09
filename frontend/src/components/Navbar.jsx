import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Shield, GraduationCap, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, loginDemo, logout } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center font-bold shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 tracking-tight">EduPulse</span>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" /> AI Early Warning
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden sm:block">Academic Dropout Warning & Counselling System</p>
          </div>
        </div>

        {/* Demo Quick Role Switcher (For Viva Demonstrations) */}
        <div className="hidden lg:flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs">
          <span className="text-gray-500 font-medium px-2">Demo Switcher:</span>
          <button
            onClick={() => loginDemo('ADMIN')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              user?.role === 'ADMIN' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => loginDemo('FACULTY')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              user?.role === 'FACULTY' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Faculty
          </button>
          <button
            onClick={() => loginDemo('STUDENT')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              user?.role === 'STUDENT' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            Student
          </button>
        </div>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                <Shield className="w-3 h-3 text-blue-600" />
                <span className="capitalize">{user.role}</span> ({user.department})
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
