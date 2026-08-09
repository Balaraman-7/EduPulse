import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RiskBadge({ level, score, showScore = true, size = 'md' }) {
  const isHigh = level === 'High' || score >= 70;
  const isMedium = level === 'Medium' || (score >= 40 && score < 70);
  const isLow = level === 'Low' || (score >= 0 && score < 40);

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs font-semibold' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-1 text-xs font-semibold';

  if (isHigh) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 ${sizeClasses}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
        <span>High Risk {showScore && score !== undefined ? `(${score}%)` : ''}</span>
      </span>
    );
  }

  if (isMedium) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>Medium Risk {showScore && score !== undefined ? `(${score}%)` : ''}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>Low Risk {showScore && score !== undefined ? `(${score}%)` : ''}</span>
    </span>
  );
}
