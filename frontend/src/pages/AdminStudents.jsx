import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import StudentModal from '../components/StudentModal';
import api from '../services/api';
import { Search, Plus, Sparkles, Edit, Trash2, UserPlus, Eye, Filter } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [predictingId, setPredictingId] = useState(null);

  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (department !== 'All') params.department = department;
      if (semester !== 'All') params.semester = semester;
      if (riskLevel !== 'All') params.riskLevel = riskLevel;

      const res = await api.get('/students', { params });
      setStudents(res.data);
    } catch (err) {
      console.error('[AdminStudents] Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/faculty');
      setFacultyList(res.data);
    } catch (err) {
      console.error('[AdminStudents] Failed to load faculty:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartmentsList(res.data);
    } catch (err) {
      console.error('[AdminStudents] Failed to load departments:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchFaculty();
    fetchDepartments();
  }, [search, department, semester, riskLevel]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student "${name}"?`)) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleRunPrediction = async (studentId) => {
    try {
      setPredictingId(studentId);
      await api.post('/predictions', { studentId });
      await fetchStudents();
    } catch (err) {
      alert('ML prediction calculation failed');
    } finally {
      setPredictingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Student Roster & Risk Directory</h1>
          <p className="text-sm text-gray-500">Manage student academic metrics, assign faculty advisors, and run ML risk models.</p>
        </div>
        <button
          onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Student
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-semibold text-gray-700"
          >
            <option value="All">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d._id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter */}
        <div>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-semibold text-gray-700"
          >
            <option value="All">All Semesters</option>
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>
            <option value="7">Sem 7</option>
            <option value="8">Sem 8</option>
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
          >
            <option value="All">All Risk Levels</option>
            <option value="High">High Risk Only</option>
            <option value="Medium">Medium Risk Only</option>
            <option value="Low">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Department & Sem</th>
                <th className="py-3.5 px-4">Attendance</th>
                <th className="py-3.5 px-4">CGPA</th>
                <th className="py-3.5 px-4">Backlogs</th>
                <th className="py-3.5 px-4">Dropout Risk</th>
                <th className="py-3.5 px-4">Faculty Advisor</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">No student records found matching search filters.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div>{student.name}</div>
                      <div className="text-xs text-gray-500 font-normal">{student.studentId} • {student.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      <div>{student.department}</div>
                      <div className="text-xs text-gray-500">Semester {student.semester}</div>
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
                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      {student.facultyId ? (
                        <span className="font-semibold text-gray-900">{student.facultyId.name}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/student-detail/${student._id}`)}
                          title="View Intervention Detail & Gemini XAI"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRunPrediction(student._id)}
                          disabled={predictingId === student._id}
                          title="Run Python ML Dropout Risk Prediction"
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }}
                          title="Edit Student Metrics"
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id, student.name)}
                          title="Delete Student"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Student Form Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        facultyList={facultyList}
        onSave={fetchStudents}
      />
    </div>
  );
}
