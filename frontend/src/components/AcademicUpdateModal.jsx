import React, { useState } from 'react';
import { X, Calendar, PlusCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function AcademicUpdateModal({ isOpen, onClose, student, onSave }) {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'academics' | 'backlog'

  // Attendance Form
  const [attForm, setAttForm] = useState({
    subject: 'Data Structures & Algorithms',
    classesHeld: 1,
    classesAttended: 1,
    date: new Date().toISOString().split('T')[0]
  });

  // Academics Form
  const [acadForm, setAcadForm] = useState({
    subject: 'Data Structures & Algorithms',
    assessmentType: 'Internal',
    assessmentName: 'Midterm Test 1',
    marksObtained: 75,
    maximumMarks: 100,
    date: new Date().toISOString().split('T')[0]
  });

  // Backlog Form
  const [backlogForm, setBacklogForm] = useState({
    subject: 'Database Systems',
    semester: student?.semester || 4,
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const handleAttendanceSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/academic-data/attendance', {
        studentId: student._id,
        ...attForm
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording attendance log');
    } finally {
      setLoading(false);
    }
  };

  const handleAcademicsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/academic-data/academics', {
        studentId: student._id,
        ...acadForm
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording assessment score');
    } finally {
      setLoading(false);
    }
  };

  const handleBacklogSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/academic-data/backlogs', {
        studentId: student._id,
        ...backlogForm
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating backlog status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Update Student Academic Data</h3>
            <p className="text-xs text-gray-500">Student: {student.name} ({student.studentId})</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 bg-gray-100/60 p-1">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'attendance' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Attendance Log
          </button>
          <button
            onClick={() => setActiveTab('academics')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'academics' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assessment Marks
          </button>
          <button
            onClick={() => setActiveTab('backlog')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'backlog' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Backlog Item
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 mb-4">
              {error}
            </div>
          )}

          {/* TAB 1: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={attForm.subject}
                  onChange={(e) => setAttForm({ ...attForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Classes Held</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={attForm.classesHeld}
                    onChange={(e) => setAttForm({ ...attForm, classesHeld: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={attForm.classesAttended}
                    onChange={(e) => setAttForm({ ...attForm, classesAttended: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Log Date</label>
                <input
                  type="date"
                  required
                  value={attForm.date}
                  onChange={(e) => setAttForm({ ...attForm, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                  {loading ? 'Saving & Re-predicting...' : 'Record Attendance & Predict'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MARKS */}
          {activeTab === 'academics' && (
            <form onSubmit={handleAcademicsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={acadForm.subject}
                  onChange={(e) => setAcadForm({ ...acadForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assessment Type</label>
                  <select
                    value={acadForm.assessmentType}
                    onChange={(e) => setAcadForm({ ...acadForm, assessmentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="Internal">Internal Test</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Practical">Practical</option>
                    <option value="Midterm">Midterm Exam</option>
                    <option value="End Semester">End Semester Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assessment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midterm 1"
                    value={acadForm.assessmentName}
                    onChange={(e) => setAcadForm({ ...acadForm, assessmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Marks Obtained</label>
                  <input
                    type="number"
                    required
                    value={acadForm.marksObtained}
                    onChange={(e) => setAcadForm({ ...acadForm, marksObtained: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    required
                    value={acadForm.maximumMarks}
                    onChange={(e) => setAcadForm({ ...acadForm, maximumMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                  {loading ? 'Saving & Re-predicting...' : 'Record Score & Predict'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BACKLOG */}
          {activeTab === 'backlog' && (
            <form onSubmit={handleBacklogSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Backlog Subject</label>
                <input
                  type="text"
                  required
                  value={backlogForm.subject}
                  onChange={(e) => setBacklogForm({ ...backlogForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Semester</label>
                  <input
                    type="number"
                    required
                    value={backlogForm.semester}
                    onChange={(e) => setBacklogForm({ ...backlogForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Backlog Status</label>
                  <select
                    value={backlogForm.status}
                    onChange={(e) => setBacklogForm({ ...backlogForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
                  >
                    <option value="Active">Active Backlog</option>
                    <option value="Cleared">Cleared Backlog</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                  {loading ? 'Saving & Re-predicting...' : 'Update Backlog & Predict'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
