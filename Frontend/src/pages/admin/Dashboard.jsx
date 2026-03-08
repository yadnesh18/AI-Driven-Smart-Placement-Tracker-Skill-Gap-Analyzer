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
} from "recharts";
import { Users, Building2, Percent, AlertTriangle, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load dashboard</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const {
    totalStudents = 0,
    totalCompanies = 0,
    eligiblePercent = 0,
    commonMissingSkill = "—",
    skillDistribution = [],
  } = stats || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your placement platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={totalStudents} icon={Users} color="indigo" />
        <StatCard title="Total Companies" value={totalCompanies} icon={Building2} color="blue" />
        <StatCard title="Eligible %" value={`${eligiblePercent}%`} icon={Percent} color="emerald" />
        <StatCard title="Common Missing Skill" value={commonMissingSkill} icon={AlertTriangle} color="amber" />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Skill Distribution</h3>
        <div className="h-72">
          {skillDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50 rounded-xl">
              No skill data yet. Students need to upload resumes.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="skill" tick={{ fill: "#64748b" }} />
                <YAxis tick={{ fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  cursor={{ fill: "#f1f5f9" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
