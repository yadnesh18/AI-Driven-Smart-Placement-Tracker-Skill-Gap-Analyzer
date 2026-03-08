import React from "react";

const StatCard = ({ title, value, icon: Icon, trend, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  const cls = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-slate-100/80 hover:border-indigo-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${cls}`}>
            <Icon className="w-6 h-6" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
