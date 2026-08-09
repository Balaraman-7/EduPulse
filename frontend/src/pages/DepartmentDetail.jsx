import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Plus, Layers, Users, ChevronRight, X, AlertTriangle } from 'lucide-react';

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [classes, setClasses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Class Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({
    name: '',
    code: '',
    academicYear: '2026-27',
    semester: 4,
    section: 'A',
    facultyId: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptRes, facRes] = await Promise.all([
        api.get(`/departments/${id}`),
        api.get('/faculty')
      ]);

      setDepartment(deptRes.data.department);
      setClasses(deptRes.data.classes);
      setTotalStudents(deptRes.data.totalStudents);
      setFacultyList(facRes.data);
    } catch (err) {
      console.error('[DepartmentDetail] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      await api.post(`/classes`, {
        departmentId: id,
        ...classForm
      });
      setIsModalOpen(false);
      setClassForm({ name: '', code: '', academicYear: '2026-27', semester: 4, section: 'A', facultyId: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating class');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading department details...</div>;
  if (!department) return <div className="p-8 text-center text-red-600 font-semibold">Department not found.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/departments')} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{department.name}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">{department.code}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Total Classes: {classes.length} • Total Enrolled Students: {totalStudents}</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Class inside Department
        </button>
      </div>

      {/* Classes Table / Cards */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Classes Roster</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Class Name & Code</th>
                <th className="py-3.5 px-4">Semester & Year</th>
                <th className="py-3.5 px-4">Enrolled Students</th>
                <th className="py-3.5 px-4">Faculty Advisor</th>
                <th className="py-3.5 px-4">Risk Breakdown</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No active classes inside this department. Click "Create Class" to add one.</td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls._id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{cls.name}</div>
                      <div className="text-xs text-gray-400 font-normal">{cls.code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700">
                      <div>Semester {cls.semester} (Section {cls.section})</div>
                      <div className="text-xs text-gray-500">{cls.academicYear}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{cls.studentCount || 0}</td>
                    <td className="py-3.5 px-4 text-xs">
                      {cls.facultyId ? (
                        <span className="font-semibold text-gray-900">{cls.facultyId.name}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded font-semibold">{cls.highRisk} High</span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-semibold">{cls.mediumRisk} Med</span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">{cls.lowRisk} Low</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/classes/${cls._id}`)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        Open Class Roster <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Create Class inside {department.code}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE-A"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Semester (1-8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={classForm.semester}
                    onChange={(e) => setClassForm({ ...classForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={classForm.academicYear}
                    onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Faculty Advisor</label>
                <select
                  value={classForm.facultyId}
                  onChange={(e) => setClassForm({ ...classForm, facultyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Select Faculty Advisor</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {modalLoading ? 'Creating...' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
