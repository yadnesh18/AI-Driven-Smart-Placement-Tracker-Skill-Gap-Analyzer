import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ProgressTracker = ({ title = "Placement Progress", progress = {} }) => {
  const data = [
    { name: "Applied", value: progress.applied || 0 },
    { name: "Shortlisted", value: progress.shortlisted || 0 },
    { name: "Interview", value: progress.interview || 0 },
    { name: "Selected", value: progress.selected || 0 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#4b5563" }} />
            <Tooltip
              labelFormatter={(label) => `${label}`}
              formatter={(value) => [value, "Count"]}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 4, 4]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressTracker;
