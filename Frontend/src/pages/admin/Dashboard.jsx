import React, { useEffect, useState } from "react";
import api from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try { const res = await api.get("/admin/dashboard"); setStats(res.data); }
      catch (err) { setError(err.response?.data?.message || err.message || "Failed to load dashboard"); }
      finally { setLoading(false); }
    };
    fetchDashboard();
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
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load dashboard</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a', marginTop: '0.25rem' }}>{error}</p>
      </div>
    </div>
  );

  const { totalStudents = 0, totalCompanies = 0, eligiblePercent = 0, commonMissingSkill = "—", skillDistribution = [] } = stats || {};

  const statCards = [
    { label: "Total Students", value: totalStudents, icon: "school", color: '#3525cd' },
    { label: "Total Companies", value: totalCompanies, icon: "business", color: '#0058be' },
    { label: "Eligible %", value: `${eligiblePercent}%`, icon: "verified", color: '#006e28' },
    { label: "Common Gap", value: commonMissingSkill, icon: "warning", color: '#a44100' },
  ];

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Admin Dashboard</h1>
        <p style={{ color: '#464555', marginTop: '0.375rem' }}>Overview of your placement platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem' }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#e2dfff', borderRadius: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
              </div>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#191c1d' }}>{s.value}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#464555' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem' }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#191c1d', marginBottom: '1rem' }}>Skill Distribution</h3>
        <div style={{ height: '18rem' }}>
          {skillDistribution.length === 0 ? (
            <div className="flex items-center justify-center" style={{ height: '100%', color: '#777587', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
              No skill data yet. Students need to upload resumes.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edeeef" />
                <XAxis dataKey="skill" tick={{ fill: "#777587", fontSize: 12 }} />
                <YAxis tick={{ fill: "#777587", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: vignetteShadow, fontFamily: "'Inter', sans-serif" }} cursor={{ fill: "#f8f9fa" }} />
                <Bar dataKey="count" fill="#3525cd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
