import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building,
  Users,
  UserCheck,
  AlertTriangle,
  FileText,
  MessageSquareHeart,
  Award
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  if (!user) return null;

  const role = user.role;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/departments', label: 'Departments & Classes', icon: Building },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/faculty', label: 'Faculty / Counsellors', icon: UserCheck },
    { to: '/admin/reports', label: 'Risk & Reports', icon: FileText }
  ];

  const facultyLinks = [
    { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/departments', label: 'Departments & Classes', icon: Building },
    { to: '/faculty/students', label: 'My Students', icon: Users },
    { to: '/faculty/alerts', label: 'Risk Alerts', icon: AlertTriangle },
    { to: '/faculty/reports', label: 'Intervention Reports', icon: FileText }
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/student/academic', label: 'My Academic Metrics', icon: FileText },
    { to: '/student/chatbot', label: 'AI Counsellor', icon: MessageSquareHeart }
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'FACULTY' ? facultyLinks : studentLinks;

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {role} Navigation
          </p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Role Footer Card */}
      <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900">
        <p className="font-semibold flex items-center gap-1.5 mb-1">
          <Award className="w-4 h-4 text-blue-600" /> EduPulse System
        </p>
        <p className="text-blue-700 leading-relaxed">
          Dynamic Dept $\rightarrow$ Class $\rightarrow$ Student hierarchy & XAI risk warning.
        </p>
      </div>
    </aside>
  );
}
