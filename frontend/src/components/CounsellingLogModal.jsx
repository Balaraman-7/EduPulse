import React, { useState } from 'react';
import { X, ClipboardList, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function CounsellingLogModal({ isOpen, onClose, student, onSave }) {
  const [notes, setNotes] = useState('');
  const [actionItemInput, setActionItemInput] = useState('');
  const [actionItems, setActionItems] = useState([
    'Daily attendance monitoring',
    'Peer tutor academic support assigned'
  ]);
  const [followUpDate, setFollowUpDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState('Intervention Active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const addActionItem = () => {
    if (actionItemInput.trim()) {
      setActionItems([...actionItems, actionItemInput.trim()]);
      setActionItemInput('');
    }
  };

  const removeActionItem = (index) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/counselling', {
        studentId: student._id,
        notes,
        actionItems,
        followUpDate,
        status
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording counselling session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Record Counselling Session</h3>
            <p className="text-xs text-gray-500">Student: {student.name} ({student.studentId})</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Intervention Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="New Alert">New Alert</option>
              <option value="Under Review">Under Review</option>
              <option value="Counselling Scheduled">Counselling Scheduled</option>
              <option value="Intervention Active">Intervention Active</option>
              <option value="Improving">Improving</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Counselling Notes & Findings</label>
            <textarea
              rows={4}
              required
              placeholder="Record summary of discussion, root causes identified, and student commitment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Agreed Action Items</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add specific goal/action..."
                value={actionItemInput}
                onChange={(e) => setActionItemInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addActionItem}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <ul className="space-y-1.5">
              {actionItems.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-md text-xs text-gray-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    {item}
                  </span>
                  <button type="button" onClick={() => removeActionItem(idx)} className="text-gray-400 hover:text-red-600">
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Follow-Up Review Date</label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
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
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Counselling Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
