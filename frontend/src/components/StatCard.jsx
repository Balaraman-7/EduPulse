import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const iconColors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <span className={`inline-block mt-2 text-xs font-semibold ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.text}
          </span>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg border ${iconColors[color] || iconColors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
