import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import StudentModal from '../components/StudentModal';
import AcademicUpdateModal from '../components/AcademicUpdateModal';
import api from '../services/api';
import {
  ArrowLeft, Plus, Users, AlertTriangle, AlertCircle, CheckCircle2,
  ClipboardList, Eye, Sparkles, Edit, PlusCircle
} from 'lucide-react';

export default function ClassDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clsData, setClsData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/classes/${id}`);
      setClsData(res.data);
    } catch (err) {
      console.error('[ClassDetail] Error loading class data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading class roster...</div>;
  if (!clsData) return <div className="p-8 text-center text-red-600 font-semibold">Class record not found.</div>;

  const { class: cls, students, stats } = clsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{cls.name}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">{cls.code}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Department: <span className="font-semibold text-gray-700">{cls.departmentId?.name}</span> • Semester {cls.semester} ({cls.academicYear})
            </p>
          </div>
        </div>

        <button
          onClick={() => { setSelectedStudent(null); setIsStudentModalOpen(true); }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Student to {cls.name}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Students" value={stats.total} subtitle={`Section ${cls.section}`} icon={Users} color="blue" />
        <StatCard title="High Risk Level" value={stats.highRisk} subtitle="Urgent review" icon={AlertTriangle} color="red" />
        <StatCard title="Medium Risk Level" value={stats.mediumRisk} subtitle="Monitor attendance" icon={AlertCircle} color="amber" />
        <StatCard title="Low Risk / Safe" value={stats.lowRisk} subtitle="On track" icon={CheckCircle2} color="green" />
      </div>

      {/* Students Roster Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Class Student Roster</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Roll No & Student</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Backlogs</th>
                <th className="py-3.5 px-4">Dropout Risk</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No students enrolled in this class yet. Click "Add Student" to enroll one.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-400 font-normal">{student.rollNumber || student.studentId} • {student.email}</div>
                    </td>
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedStudent(student); setIsAcademicModalOpen(true); }}
                          title="Log Attendance / Marks / Backlog"
                          className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-semibold border border-purple-200 transition flex items-center gap-1"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Log Score
                        </button>
                        <button
                          onClick={() => navigate(`/student-detail/${student._id}`)}
                          title="View Intervention Profile & Risk Trends"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        student={selectedStudent}
        onSave={loadData}
      />

      <AcademicUpdateModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
        student={selectedStudent}
        onSave={loadData}
      />
    </div>
  );
}
