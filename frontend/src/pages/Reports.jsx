import React, { useState, useEffect } from 'react';
import RiskBadge from '../components/RiskBadge';
import api from '../services/api';
import { FileText, Download, Printer, Shield, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students');
        setStudents(res.data);
      } catch (err) {
        console.error('[Reports] Error loading students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const highRiskCount = students.filter(s => s.riskLevel === 'High').length;
  const mediumRiskCount = students.filter(s => s.riskLevel === 'Medium').length;
  const lowRiskCount = students.filter(s => s.riskLevel === 'Low').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Institution Risk & Intervention Reports</h1>
          <p className="text-sm text-gray-500">Official dropout early-warning report for academic administration review.</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm shadow-xs flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print / Export Report
        </button>
      </div>

      {/* Summary Box */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <p className="font-semibold text-gray-500">TOTAL EVALUATED</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{students.length} Students</p>
        </div>
        <div>
          <p className="font-semibold text-red-600">HIGH RISK</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{highRiskCount} Cases</p>
        </div>
        <div>
          <p className="font-semibold text-amber-600">MEDIUM RISK</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{mediumRiskCount} Cases</p>
        </div>
        <div>
          <p className="font-semibold text-emerald-600">LOW RISK</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{lowRiskCount} Cases</p>
        </div>
      </div>

      {/* Printable Report Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Official Report Log</span>
          <span className="text-xs text-gray-500">Generated: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700 uppercase">
                <th className="py-3 px-4">Student ID</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Sem</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Backlogs</th>
                <th className="py-3 px-4">Model Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500">Loading report data...</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td className="py-2.5 px-4 font-mono font-semibold text-gray-900">{student.studentId}</td>
                    <td className="py-2.5 px-4 font-bold text-gray-900">{student.name}</td>
                    <td className="py-2.5 px-4 text-gray-700">{student.department}</td>
                    <td className="py-2.5 px-4 text-gray-700">{student.semester}</td>
                    <td className="py-2.5 px-4 font-bold">{student.attendancePercentage}%</td>
                    <td className="py-2.5 px-4 font-bold">{student.cgpa}</td>
                    <td className="py-2.5 px-4 font-bold">{student.backlogCount}</td>
                    <td className="py-2.5 px-4">
                      <RiskBadge level={student.riskLevel} score={student.riskScore} size="sm" />
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
