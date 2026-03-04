import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const dummyStats = {
  totalStudents: 1200,
  eligiblePercent: 78,
  commonMissingSkill: 'TypeScript',
};

const skillDistribution = [
  { skill: 'JavaScript', count: 900 },
  { skill: 'React', count: 750 },
  { skill: 'CSS', count: 600 },
  { skill: 'Python', count: 500 },
  { skill: 'Algorithms', count: 400 },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Total Students</h3>
          <p className="text-2xl font-bold">{dummyStats.totalStudents}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Eligible %</h3>
          <p className="text-2xl font-bold">{dummyStats.eligiblePercent}%</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-1">Common Missing Skill</h3>
          <p className="text-2xl font-bold">{dummyStats.commonMissingSkill}</p>
        </div>
      </div>

      {/* bar chart */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Skill Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skillDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

