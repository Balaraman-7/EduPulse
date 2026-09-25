import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import api from '../services/api';

const DEFAULT_DEPARTMENTS = [
  { _id: '6a78941dd27d175b877b799b', name: 'Computer Science & Engineering', code: 'CSE' },
  { _id: '6a78941dd27d175b877b799d', name: 'Information Technology', code: 'IT' },
  { _id: '6a78941dd27d175b877b799f', name: 'Electronics & Communication', code: 'ECE' }
];

const DEFAULT_CLASSES = [
  { _id: '6a78941dd27d175b877b79a1', name: 'CSE-A', departmentId: '6a78941dd27d175b877b799b', semester: 4, academicYear: '2026-27' },
  { _id: '6a78941dd27d175b877b79a3', name: 'CSE-B', departmentId: '6a78941dd27d175b877b799b', semester: 4, academicYear: '2026-27' },
  { _id: '6a78941dd27d175b877b79a5', name: 'IT-A', departmentId: '6a78941dd27d175b877b799d', semester: 6, academicYear: '2026-27' },
  { _id: '6a78941dd27d175b877b79a7', name: 'ECE-A', departmentId: '6a78941dd27d175b877b799f', semester: 4, academicYear: '2026-27' }
];

const getIdStr = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj._id) return String(obj._id);
  if (obj.id) return String(obj.id);
  return String(obj);
};

const getClassDeptIdStr = (c) => {
  if (!c || !c.departmentId) return '';
  if (typeof c.departmentId === 'object' && c.departmentId._id) {
    return String(c.departmentId._id);
  }
  return String(c.departmentId);
};

export default function StudentModal({ isOpen, onClose, student, onSave }) {
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rollNumber: '',
    admissionYear: 2026,
    departmentId: DEFAULT_DEPARTMENTS[0]._id,
    classId: DEFAULT_CLASSES[0]._id,
    gender: 'Male',
    attendancePercentage: 75,
    internalMarks: 65,
    assignmentScore: 70,
    cgpa: 7.0,
    backlogCount: 0,
    feeStatus: 'Paid',
    familyIncomeCategory: 'Medium',
    internetAccess: 'Yes',
    extracurricularParticipation: 'Moderate',
    facultyId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Departments, Classes, and Faculty list on load
  useEffect(() => {
    if (!isOpen) return;

    const loadDropdownData = async () => {
      let depts = DEFAULT_DEPARTMENTS;
      let clss = DEFAULT_CLASSES;
      let facs = [];

      try {
        const [deptRes, classRes, facRes] = await Promise.all([
          api.get('/departments').catch(() => ({ data: [] })),
          api.get('/classes').catch(() => ({ data: [] })),
          api.get('/faculty').catch(() => ({ data: [] }))
        ]);

        if (Array.isArray(deptRes.data) && deptRes.data.length > 0) {
          depts = deptRes.data;
        }
        if (Array.isArray(classRes.data) && classRes.data.length > 0) {
          clss = classRes.data;
        }
        if (Array.isArray(facRes.data)) {
          facs = facRes.data;
        }
      } catch (err) {
        console.warn('[StudentModal] Using default dropdown fallback:', err.message);
      }

      setDepartments(depts);
      setClasses(clss);
      setFacultyList(facs);

      if (student) {
        const deptId = getIdStr(student.departmentId) || getIdStr(depts[0]);
        const availClasses = clss.filter(c => getClassDeptIdStr(c) === deptId);
        const clsId = getIdStr(student.classId) || (availClasses[0] ? getIdStr(availClasses[0]) : '');

        setFormData({
          name: student.name || '',
          email: student.email || '',
          phone: student.phone || '',
          rollNumber: student.rollNumber || '',
          admissionYear: student.admissionYear || 2026,
          departmentId: deptId,
          classId: clsId,
          gender: student.gender || 'Male',
          attendancePercentage: student.attendancePercentage ?? 75,
          internalMarks: student.internalMarks ?? 65,
          assignmentScore: student.assignmentScore ?? 70,
          cgpa: student.cgpa ?? 7.0,
          backlogCount: student.backlogCount ?? 0,
          feeStatus: student.feeStatus || 'Paid',
          familyIncomeCategory: student.familyIncomeCategory || 'Medium',
          internetAccess: student.internetAccess || 'Yes',
          extracurricularParticipation: student.extracurricularParticipation || 'Moderate',
          facultyId: getIdStr(student.facultyId)
        });
        setFilteredClasses(availClasses);
      } else {
        const firstDeptId = getIdStr(depts[0]);
        const availClasses = clss.filter(c => getClassDeptIdStr(c) === firstDeptId);
        setFormData(prev => ({
          ...prev,
          departmentId: firstDeptId,
          classId: availClasses[0] ? getIdStr(availClasses[0]) : (clss[0] ? getIdStr(clss[0]) : '')
        }));
        setFilteredClasses(availClasses.length > 0 ? availClasses : clss);
      }
    };

    loadDropdownData();
  }, [isOpen, student]);

  // Handle Cascading Selection: When Department changes, filter Classes!
  const handleDepartmentChange = (deptId) => {
    const targetDeptId = String(deptId || '');
    const availClasses = classes.filter(c => getClassDeptIdStr(c) === targetDeptId);
    setFilteredClasses(availClasses.length > 0 ? availClasses : classes);
    setFormData(prev => ({
      ...prev,
      departmentId: targetDeptId,
      classId: availClasses[0] ? getIdStr(availClasses[0]) : (classes[0] ? getIdStr(classes[0]) : '')
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter Full Name');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter Email Address');
      return;
    }
    if (!formData.departmentId) {
      setError('Please select a valid Department');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (student) {
        await api.put(`/students/${student._id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('[StudentModal Error]:', err);
      setError(err.response?.data?.message || 'Error saving student record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {student ? 'Edit Student Profile & Hierarchy' : 'Add Student to Class'}
            </h3>
            <p className="text-xs text-gray-500">
              Select Department and Class hierarchy from database dropdowns.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Academic Hierarchy Selection (Cascading Dropdowns) */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Academic Placement (Cascading Hierarchy)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Department</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {departments.map(d => (
                    <option key={getIdStr(d)} value={getIdStr(d)}>{d.name} ({d.code || 'DEPT'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Class inside Department</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {(filteredClasses.length > 0 ? filteredClasses : classes).map(c => (
                    <option key={getIdStr(c)} value={getIdStr(c)}>{c.name} (Sem {c.semester || 4} - {c.academicYear || '2026-27'})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Student Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-CSE-01"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Admission Year</label>
                <input
                  type="number"
                  value={formData.admissionYear}
                  onChange={(e) => setFormData({ ...formData, admissionYear: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Features */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Baseline Metrics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Attendance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendancePercentage}
                  onChange={(e) => setFormData({ ...formData, attendancePercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">CGPA (0.0 - 10.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Backlog Count</label>
                <input
                  type="number"
                  min="0"
                  value={formData.backlogCount}
                  onChange={(e) => setFormData({ ...formData, backlogCount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Internal Marks (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.internalMarks}
                  onChange={(e) => setFormData({ ...formData, internalMarks: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Advisor</label>
                <select
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Use Class Faculty Advisor</option>
                  {facultyList.map(f => (
                    <option key={getIdStr(f)} value={getIdStr(f)}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Processing...' : student ? 'Update & Predict' : 'Create & Predict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
