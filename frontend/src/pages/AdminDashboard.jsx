import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { Users, AlertTriangle, AlertCircle, CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/overview');
        setData(res.data);
      } catch (err) {
        console.error('[AdminDashboard] Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading system analytics...</div>;
  }

  const { summary, riskDistribution, departmentStats, semesterStats, attendanceVsRisk, cgpaVsRisk, interventionTrend } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Institution Risk Analytics</h1>
        <p className="text-sm text-gray-500">Real-time dropout risk classification and counselling intervention trends across departments.</p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Enrolled Students"
          value={summary?.totalStudents || 0}
          subtitle="Monitored in system"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="High Risk Classification"
          value={summary?.highRisk || 0}
          subtitle="Requires early intervention"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Medium Risk Classification"
          value={summary?.mediumRisk || 0}
          subtitle="Monitored closely"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Active Interventions"
          value={summary?.activeInterventions || 0}
          subtitle={`${summary?.improvingStudents || 0} students improving`}
          icon={ClipboardList}
          color="green"
        />
      </div>

      {/* Analytics Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <h3 className="text-base font-bold text-gray-900 mb-1">Dropout Risk Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Overall student risk breakdown</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department-wise Risk Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs lg:col-span-2">
          <h3 className="text-base font-bold text-gray-900 mb-1">Department-wise Risk Statistics</h3>
          <p className="text-xs text-gray-500 mb-4">Risk level breakdown per academic department</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="highRisk" name="High Risk" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mediumRisk" name="Medium Risk" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lowRisk" name="Low Risk" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Semester-wise Risk Distribution */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Semester-wise Risk Comparison</h3>
          <p className="text-xs text-gray-500 mb-4">Risk distribution across academic semesters</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="highRisk" name="High Risk" fill="#EF4444" stackId="a" />
                <Bar dataKey="mediumRisk" name="Medium Risk" fill="#F59E0B" stackId="a" />
                <Bar dataKey="lowRisk" name="Low Risk" fill="#10B981" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Intervention Trend */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <h3 className="text-base font-bold text-gray-900 mb-1">Monthly Counselling & Resolution Trend</h3>
          <p className="text-xs text-gray-500 mb-4">New alerts vs resolved student interventions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={interventionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="newAlerts" name="New Risk Alerts" stroke="#2563EB" fill="#DBEAFE" />
                <Area type="monotone" dataKey="resolved" name="Resolved Cases" stroke="#10B981" fill="#D1FAE5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
