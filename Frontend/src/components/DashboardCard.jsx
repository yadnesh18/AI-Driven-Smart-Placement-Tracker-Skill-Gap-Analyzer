import React from "react";

const DashboardCard = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-slate-100/80 p-6 hover:shadow-lg transition-shadow ${className}`}>
      {title && <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
};

export default DashboardCard;
