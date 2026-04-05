import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';
const COLORS = ["#3525cd", "#4f46e5", "#7c3aed", "#0058be", "#a855f7", "#06b6d4", "#0d9488", "#f97316", "#ef4444", "#f59e0b"];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try { const res = await api.get("/admin/analytics"); setData(res.data); }
      catch (err) { setError(err.response?.data?.message || err.message || "Failed to load analytics"); }
      finally { setLoading(false); }
    };
    fetchAnalytics();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid #e2dfff', borderTopColor: '#3525cd', borderRadius: '9999px' }} />
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3" style={{ borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#ffdad6' }}>
      <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>error</span>
      <div>
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load analytics</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a' }}>{error}</p>
      </div>
    </div>
  );

  const { totalStudents = 0, totalCompanies = 0, totalAnalyses = 0, eligiblePercent = 0, skillDistribution = [] } = data || {};
  const eligibilityData = [{ name: "Eligible", value: eligiblePercent }, { name: "Not Eligible", value: 100 - eligiblePercent }];

  const statCards = [
    { label: "Total Students", value: totalStudents, icon: "school" },
    { label: "Total Companies", value: totalCompanies, icon: "business" },
    { label: "Analyses Run", value: totalAnalyses, icon: "analytics" },
    { label: "Eligible %", value: `${eligiblePercent}%`, icon: "verified" },
  ];

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Analytics</h1>
        <p style={{ color: '#464555', marginTop: '0.375rem' }}>Summary of placement activity and skill trends.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem' }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#e2dfff', borderRadius: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#3525cd' }}>{s.icon}</span>
              </div>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#191c1d' }}>{s.value}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#464555' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eligibility Pie */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#191c1d', marginBottom: '1rem' }}>Eligibility Breakdown</h3>
          <div style={{ height: '16rem' }}>
            {totalAnalyses === 0 ? (
              <div className="flex items-center justify-center" style={{ height: '100%', color: '#777587', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                No analysis data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={eligibilityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    <Cell fill="#3525cd" />
                    <Cell fill="#edeeef" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: vignetteShadow, fontFamily: "'Inter', sans-serif" }} />
                  <Legend wrapperStyle={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8125rem' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill Distribution */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#191c1d', marginBottom: '1rem' }}>Top Matched Skills</h3>
          <div style={{ height: '16rem' }}>
            {skillDistribution.length === 0 ? (
              <div className="flex items-center justify-center" style={{ height: '100%', color: '#777587', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                No skill data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDistribution} layout="vertical" margin={{ top: 20, right: 20, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#edeeef" />
                  <XAxis type="number" tick={{ fill: "#777587", fontSize: 12 }} />
                  <YAxis type="category" dataKey="skill" width={55} tick={{ fill: "#777587", fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: vignetteShadow, fontFamily: "'Inter', sans-serif" }} cursor={{ fill: "#f8f9fa" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {skillDistribution.map((_, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}
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
