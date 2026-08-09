import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import CounsellingLogModal from '../components/CounsellingLogModal';
import AcademicUpdateModal from '../components/AcademicUpdateModal';
import api from '../services/api';
import {
  ArrowLeft, Sparkles, AlertTriangle, BookOpen, Clock, Calendar, CheckCircle2,
  FileText, User, UserCheck, RefreshCw, Award, PlusCircle, TrendingUp, Layers
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function StudentInterventionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [academicHistory, setAcademicHistory] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Student Profile
      const studentRes = await api.get(`/students/${id}`);
      setStudent(studentRes.data);

      // 2. Fetch Predictions History
      const predRes = await api.get(`/predictions/${id}`);
      setPredictions(predRes.data);

      // 3. Fetch Gemini Recommendations
      const recRes = await api.get(`/ai/recommendations/${id}`);
      setRecommendation(recRes.data);

      // 4. Fetch Counselling Sessions
      const sessRes = await api.get(`/counselling/student/${id}`);
      setSessions(sessRes.data);

      // 5. Fetch Historical Academic Logs
      const historyRes = await api.get(`/academic-data/student/${id}`);
      setAcademicHistory(historyRes.data);
    } catch (err) {
      console.error('[StudentDetail] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [id]);

  const handleRefreshAI = async () => {
    try {
      setRefreshingAI(true);
      const res = await api.post('/ai/recommendations/refresh', { studentId: id });
      setRecommendation(res.data);
    } catch (err) {
      alert('Failed to refresh Gemini AI recommendations');
    } finally {
      setRefreshingAI(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading student intervention profile...</div>;
  }

  if (!student) {
    return <div className="p-8 text-center text-red-600 font-semibold">Student profile not found.</div>;
  }

  const latestPrediction = predictions[0] || {
    riskScore: student.riskScore,
    riskLevel: student.riskLevel,
    topFactors: [
      { feature: 'attendancePercentage', friendlyName: 'Low Attendance Rate', importance: 0.35, description: `Attendance is currently ${student.attendancePercentage}%.` }
    ]
  };

  // Reformat predictions for Risk Trend Line Chart
  const predictionTrendData = predictions
    .slice()
    .reverse()
    .map(p => ({
      date: new Date(p.predictionDate || p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      riskScore: p.riskScore
    }));

  return (
    <div className="space-y-6">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{student.name}</h1>
              <RiskBadge level={student.riskLevel} score={student.riskScore} size="lg" />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              ID: <span className="font-semibold text-gray-700">{student.studentId}</span> • Department: <span className="font-semibold text-gray-700">{student.departmentId?.name || student.department}</span> • Class: <span className="font-semibold text-gray-700">{student.classId?.name || 'Class'}</span> (Sem {student.semester})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAcademicModalOpen(true)}
            className="px-3.5 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <PlusCircle className="w-4 h-4" /> Log Scores / Attendance
          </button>
          <button
            onClick={handleRefreshAI}
            disabled={refreshingAI}
            className="px-3.5 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshingAI ? 'animate-spin' : ''}`} />
            {refreshingAI ? 'Generating...' : 'Refresh AI'}
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4" /> Record Session Log
          </button>
        </div>
      </div>

      {/* Academic Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Overall Attendance</p>
          <p className={`text-xl font-bold mt-1 ${student.attendancePercentage < 75 ? 'text-red-600' : 'text-gray-900'}`}>
            {student.attendancePercentage}%
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">CGPA</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{student.cgpa}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Active Backlogs</p>
          <p className={`text-xl font-bold mt-1 ${student.backlogCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {student.backlogCount}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Internal Marks</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{student.internalMarks}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Assignments</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{student.assignmentScore}%</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
          <p className="text-xs text-gray-500 font-medium">Fee Status</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{student.feeStatus}</p>
        </div>
      </div>

      {/* Risk Prediction History Line Chart */}
      {predictionTrendData.length > 1 && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Historical Dropout Risk Score Trend
            </h3>
            <span className="text-xs text-gray-500 font-medium">Preserved Prediction History ({predictionTrendData.length} Snapshots)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="riskScore" name="Risk Score %" stroke="#2563EB" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Main Grid - Left: ML & Gemini XAI | Right: Counselling Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide): Explainable AI & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Machine Learning Explainability (XAI) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" /> Explainable Risk Factors (XAI)
                </h3>
                <p className="text-xs text-gray-500">
                  Feature importances calculated by {latestPrediction.modelVersion || 'ML Model'}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                Score: {latestPrediction.riskScore}%
              </span>
            </div>

            <div className="space-y-3">
              {latestPrediction.topFactors?.map((factor, idx) => {
                const percent = Math.min(100, Math.round((factor.importance || 0.2) * 200));
                return (
                  <div key={idx} className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{factor.friendlyName || factor.feature}</span>
                      <span className="font-semibold text-blue-700">Factor Impact: {percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    {factor.description && (
                      <p className="text-xs text-gray-600">{factor.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gemini AI Counselling & Support Strategy */}
          {recommendation && (
            <div className="bg-gradient-to-br from-blue-50/50 via-white to-gray-50 p-5 rounded-xl border border-blue-100 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-blue-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" /> Gemini AI Counselling Strategy
                </h3>
                <p className="text-xs text-blue-700 mt-0.5">
                  Natural language interpretations generated from student metrics.
                </p>
              </div>

              {/* Assessment Overview */}
              <div className="bg-white p-4 rounded-xl border border-blue-200 text-xs text-gray-800 leading-relaxed shadow-2xs">
                <p className="font-bold text-blue-900 mb-1">Humanized Assessment Overview:</p>
                <p>{recommendation.riskExplanation}</p>
              </div>

              {/* Faculty Suggestions */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                  Suggested Faculty Actions
                </h4>
                <div className="space-y-2">
                  {recommendation.facultySuggestions?.map((sug, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Study Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2.5">
                  Personalized Student Study Recommendations
                </h4>
                <div className="space-y-2">
                  {recommendation.studentStudyPlan?.map((plan, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-700">
                      <BookOpen className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{plan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col wide): Counselling History & Session Log */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-700" /> Session History
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                {sessions.length} Logged
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                No formal counselling sessions logged yet. Click "Record Session Log" to add initial check-in notes.
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((sess) => (
                  <div key={sess._id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {new Date(sess.sessionDate).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px]">
                        {sess.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      "{sess.notes}"
                    </p>

                    {sess.actionItems && sess.actionItems.length > 0 && (
                      <div className="border-t border-gray-200 pt-2 space-y-1">
                        <p className="text-[11px] font-bold text-gray-500 uppercase">Action Items:</p>
                        <ul className="space-y-1">
                          {sess.actionItems.map((item, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CounsellingLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        student={student}
        onSave={loadAllData}
      />

      <AcademicUpdateModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
        student={student}
        onSave={loadAllData}
      />
    </div>
  );
}
