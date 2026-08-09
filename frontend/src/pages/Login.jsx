import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, Shield, UserCheck, User, Sparkles, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginDemo } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      redirectUser(loggedUser.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await loginDemo(role);
      redirectUser(loggedUser.role);
    } catch (err) {
      setError('Demo login failed. Make sure backend is running and database is seeded.');
    } finally {
      setLoading(false);
    }
  };

  const redirectUser = (role) => {
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'FACULTY') navigate('/faculty/dashboard');
    else navigate('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          EduPulse
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          AI-Powered Student Dropout Early Warning & Counselling System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-200 sm:px-10">
          
          {/* Demo Account Quick Selector Card */}
          <div className="mb-6 p-4 bg-blue-50/80 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" /> Viva Demo Instant Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('ADMIN')}
                className="p-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-600 hover:text-white transition flex flex-col items-center gap-1 shadow-xs"
              >
                <Shield className="w-4 h-4" /> Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('FACULTY')}
                className="p-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-600 hover:text-white transition flex flex-col items-center gap-1 shadow-xs"
              >
                <UserCheck className="w-4 h-4" /> Faculty
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('STUDENT')}
                className="p-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-600 hover:text-white transition flex flex-col items-center gap-1 shadow-xs"
              >
                <User className="w-4 h-4" /> Student
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. admin@demo.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign in to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
