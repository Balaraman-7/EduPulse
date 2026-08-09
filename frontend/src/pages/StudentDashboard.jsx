import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import api from '../services/api';
import {
  BookOpen, Sparkles, MessageSquareHeart, CheckCircle2, User, Phone, Mail, Award, ArrowRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { studentProfile } = useContext(AuthContext);
  const [student, setStudent] = useState(studentProfile || null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const meRes = await api.get('/auth/me');
        const s = meRes.data.studentProfile;
        setStudent(s);

        if (s) {
          const recRes = await api.get(`/ai/recommendations/${s._id}`);
          setRecommendation(recRes.data);
        }
      } catch (err) {
        console.error('[StudentDashboard] Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading your student dashboard...</div>;
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-gray-500">
        Student profile record not found. Please log in with a student account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-white/90">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold mt-2">Welcome back, {student.name}!</h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl leading-relaxed">
            EduPulse monitors your academic metrics to provide personalized study guidance and support recommendations.
          </p>
        </div>
        <button
          onClick={() => navigate('/student/chatbot')}
          className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 shrink-0 transition"
        >
          <MessageSquareHeart className="w-4 h-4 text-blue-600" /> Talk to AI Counsellor
        </button>
      </div>

      {/* Academic Indicators Overview Cards */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Academic Indicators Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-medium">Attendance</p>
            <p className={`text-2xl font-bold mt-1 ${student.attendancePercentage < 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {student.attendancePercentage}%
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Required: 75%</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-medium">CGPA</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{student.cgpa}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Scale: 10.0</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-medium">Active Backlogs</p>
            <p className={`text-2xl font-bold mt-1 ${student.backlogCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {student.backlogCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Subjects pending</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-medium">Internal Score</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{student.internalMarks}%</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Test average</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <p className="text-xs text-gray-500 font-medium">Assignments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{student.assignmentScore}%</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Submission rate</p>
          </div>
        </div>
      </div>

      {/* Support Status Notice */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Academic Status Note:</p>
          <p className="text-blue-800 mt-0.5 leading-relaxed">
            {student.riskLevel === 'High' || student.riskLevel === 'Medium'
              ? 'Your current academic indicators suggest that additional guidance and faculty check-ins may be helpful to boost your semester scores.'
              : 'Your academic indicators are currently on track! Keep up the consistent effort and regular class participation.'}
          </p>
        </div>
      </div>

      {/* Grid: Left: Weekly Study Plan | Right: Faculty Advisor Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 Cols): Gemini Personalized Study Plan */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" /> Personalized Weekly Study Strategy
              </h3>
              <p className="text-xs text-gray-500">AI-customized study goals based on your current subjects and performance.</p>
            </div>
          </div>

          {recommendation?.studentStudyPlan && (
            <div className="space-y-3">
              {recommendation.studentStudyPlan.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900">Action Goal {idx + 1}</p>
                    <p className="text-gray-700 leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {recommendation?.encouragingMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
              <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" /> Encouraging Note
              </p>
              <p className="text-emerald-800 italic">"{recommendation.encouragingMessage}"</p>
            </div>
          )}
        </div>

        {/* Right (1 Col): Faculty Counsellor Contact & AI Chatbot Entry */}
        <div className="space-y-5">
          {/* Faculty Counsellor Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">Assigned Faculty Advisor</h3>
            {student.facultyId ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                    {student.facultyId.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{student.facultyId.name}</p>
                    <p className="text-gray-500">{student.facultyId.department}</p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{student.facultyId.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No faculty advisor explicitly assigned yet.</p>
            )}
          </div>

          {/* AI Counsellor CTA Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
              <MessageSquareHeart className="w-5 h-5 text-indigo-600" /> AI Counselling Chatbot
            </div>
            <p className="text-indigo-800 leading-relaxed">
              Ask questions about attendance improvement, clearing backlogs, or study schedules anytime.
            </p>
            <button
              onClick={() => navigate('/student/chatbot')}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition"
            >
              Start Chat Conversation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
