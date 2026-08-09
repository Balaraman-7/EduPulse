import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Building, Plus, Layers, Users, ChevronRight, X, Sparkles } from 'lucide-react';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active'
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('[DepartmentManagement] Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setError('');

    try {
      await api.post('/departments', formData);
      setIsModalOpen(false);
      setFormData({ name: '', code: '', description: '', status: 'Active' });
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating department');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Academic Department Management</h1>
          <p className="text-sm text-gray-500">Manage academic departments, classes, and dynamic student enrollments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Department
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-8 text-center text-gray-500">Loading departments...</div>
        ) : departments.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500">No departments configured yet. Click "Create Department" to start.</div>
        ) : (
          departments.map((dept) => (
            <div
              key={dept._id}
              onClick={() => navigate(`/admin/departments/${dept._id}`)}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-lg">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">{dept.name}</h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                        {dept.status}
                      </span>
                    </div>
                  </div>
                </div>
                {dept.description && (
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">{dept.description}</p>
                )}
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 font-semibold text-gray-900">
                    <Layers className="w-4 h-4 text-blue-600" /> {dept.classCount || 0} Classes
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-gray-900">
                    <Users className="w-4 h-4 text-gray-400" /> {dept.studentCount || 0} Students
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Create New Department</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of department..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
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
                  {modalLoading ? 'Creating...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
