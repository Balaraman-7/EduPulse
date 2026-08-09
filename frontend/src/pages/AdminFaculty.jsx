import React, { useState, useEffect } from 'react';
import FacultyModal from '../components/FacultyModal';
import api from '../services/api';
import { UserCheck, Plus, Mail, Phone, Building } from 'lucide-react';

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const res = await api.get('/faculty');
      setFaculty(res.data);
    } catch (err) {
      console.error('[AdminFaculty] Failed to load faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty & Counsellors</h1>
          <p className="text-sm text-gray-500">Manage academic faculty members and student assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Faculty / Counsellor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-8 text-center text-gray-500">Loading faculty members...</div>
        ) : faculty.length === 0 ? (
          <div className="col-span-full py-8 text-center text-gray-500">No faculty accounts found.</div>
        ) : (
          faculty.map((f) => (
            <div key={f._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    {f.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{f.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{f.role}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{f.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{f.email}</span>
                </div>
                {f.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{f.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <FacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchFaculty}
      />
    </div>
  );
}
