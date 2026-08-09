import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import api from '../services/api';
import { Users, AlertTriangle, AlertCircle, CheckCircle2, ArrowRight, ClipboardList } from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const res = await api.get('/faculty/assigned-students');
        setData(res.data);
      } catch (err) {
        console.error('[FacultyDashboard] Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFacultyData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading faculty dashboard...</div>;
  }

  const { stats, students } = data || {};
  const highRiskStudents = students?.filter(s => s.riskLevel === 'High') || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty & Counsellor Dashboard</h1>
        <p className="text-sm text-gray-500">Monitor assigned students, review ML risk factors, and log early counselling interventions.</p>
      </div>

      {/* High-Risk High-Priority Alert Banner */}
      {highRiskStudents.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-4 shadow-xs">
          <div className="p-3 bg-red-600 text-white rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-red-900">
              High-Risk Alert: {highRiskStudents.length} Student(s) Require Early Intervention
            </h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              Model-estimated indicators (low attendance, active backlogs, or internal grade decline) indicate these students need proactive check-ins.
            </p>
            <div className="mt-3 flex items-center gap-3">
              {highRiskStudents.slice(0, 3).map(s => (
                <button
                  key={s._id}
                  onClick={() => navigate(`/student-detail/${s._id}`)}
                  className="px-3 py-1 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition flex items-center gap-1.5 shadow-xs"
                >
                  {s.name} ({s.attendancePercentage}% Att) <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={stats?.total || 0}
          subtitle="Under your advisement"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="High Risk Level"
          value={stats?.highRisk || 0}
          subtitle="Immediate review"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Medium Risk Level"
          value={stats?.mediumRisk || 0}
          subtitle="Monitor performance"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Low Risk / On Track"
          value={stats?.lowRisk || 0}
          subtitle="Meeting standards"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Assigned Students Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Assigned Student Roster</h3>
            <p className="text-xs text-gray-500">Sorted by highest model-estimated risk score first</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Semester</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Backlogs</th>
                <th className="py-3.5 px-4">Model Risk</th>
                <th className="py-3.5 px-4 text-right">Intervention Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {students?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">No students currently assigned to you.</td>
                </tr>
              ) : (
                students?.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500 font-normal">{student.studentId} • {student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">Semester {student.semester}</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${student.attendancePercentage < 75 ? 'text-red-600' : 'text-gray-900'}`}>
                        {student.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{student.cgpa}</td>
                    <td className="py-3.5 px-4">
                      <span className={`font-bold ${student.backlogCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {student.backlogCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <RiskBadge level={student.riskLevel} score={student.riskScore} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/student-detail/${student._id}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <ClipboardList className="w-3.5 h-3.5" /> Open Intervention
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
