import React, { useEffect, useState } from "react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Users, Building2, Percent, BarChart3, AlertCircle, Target } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f97316", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/admin/analytics");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load analytics</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalStudents = 0,
    totalCompanies = 0,
    totalAnalyses = 0,
    eligiblePercent = 0,
    skillDistribution = [],
  } = data || {};

  const eligibilityData = [
    { name: "Eligible", value: eligiblePercent },
    { name: "Not Eligible", value: 100 - eligiblePercent },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-slate-500 mt-1">
          Summary of placement activity and skill trends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="indigo" />
        <StatCard title="Total Companies" value={totalCompanies} icon={Building2} color="blue" />
        <StatCard title="Analyses Run" value={totalAnalyses} icon={Target} color="violet" />
        <StatCard title="Eligible %" value={`${eligiblePercent}%`} icon={Percent} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eligibility Pie */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Eligibility Breakdown</h3>
          <div className="h-64">
            {totalAnalyses === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50 rounded-xl">
                No analysis data yet. Students need to run analyses.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eligibilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Matched Skills</h3>
          <div className="h-64">
            {skillDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50 rounded-xl">
                No skill data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillDistribution}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: "#64748b" }} />
                  <YAxis type="category" dataKey="skill" width={55} tick={{ fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {skillDistribution.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
