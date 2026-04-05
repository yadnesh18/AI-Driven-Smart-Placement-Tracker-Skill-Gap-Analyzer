import React, { useEffect, useState } from "react";
import api from "../../services/api";

const badgeStyle = (status) => {
  const base = { fontSize: '0.625rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '0.375rem', textTransform: 'uppercase' };
  switch (status) {
    case "selected": return { ...base, backgroundColor: '#e2dfff', color: '#3525cd' };
    case "interview": return { ...base, backgroundColor: '#d8e2ff', color: '#0058be' };
    case "shortlisted": return { ...base, backgroundColor: '#e2dfff', color: '#3323cc' };
    case "rejected": return { ...base, backgroundColor: '#ffdad6', color: '#ba1a1a' };
    default: return { ...base, backgroundColor: '#edeeef', color: '#464555' };
  }
};

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [skillRadar, setSkillRadar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashRes, radarRes] = await Promise.allSettled([
          api.get("/student/dashboard"),
          api.get("/student/analysis/skill-radar"),
        ]);
        if (dashRes.status === "fulfilled") setDashboard(dashRes.value.data);
        if (radarRes.status === "fulfilled") setSkillRadar(radarRes.value.data);
        if (dashRes.status === "rejected") {
          setError(dashRes.reason?.response?.data?.message || "Failed to load dashboard");
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid #e2dfff', borderTopColor: '#3525cd', borderRadius: '9999px', margin: '0 auto 1rem' }} />
        <p style={{ color: '#777587', fontSize: '0.875rem', fontWeight: 500 }}>Loading your dashboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3" style={{ borderRadius: '1rem', padding: '1.25rem', backgroundColor: '#ffdad6' }}>
      <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '1.25rem', marginTop: '0.125rem' }}>error</span>
      <div>
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load dashboard</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a', marginTop: '0.25rem' }}>{error}</p>
      </div>
    </div>
  );

  const raw = dashboard || {};
  const name = raw.name || "Student";
  const resumeUploaded = raw.resumeUploaded;
  const resumeScore = typeof raw.resumeScore === "number" ? raw.resumeScore : 0;
  const skills = Array.isArray(raw.skills) ? raw.skills : [];
  const appliedCompanies = Array.isArray(raw.appliedCompanies) ? raw.appliedCompanies : [];
  const progress = raw.progress && typeof raw.progress === "object"
    ? raw.progress
    : { applied: 0, shortlisted: 0, interview: 0, selected: 0 };
  const improvementSuggestions = Array.isArray(raw.improvementSuggestions) ? raw.improvementSuggestions : [];
  const missingSkills = skillRadar?.missingSkills || raw.missingSkills || [];
  const missingSkillsWithResources = skillRadar?.missingSkillsWithResources || [];
  const latestCompany = skillRadar?.latestCompany;
  const latestRole = skillRadar?.latestRole;
  const overallScore = skillRadar?.overallScore;
  const eligible = skillRadar?.eligible;
  const totalApps = (progress.applied || 0) + (progress.shortlisted || 0) + (progress.interview || 0) + (progress.selected || 0);
  const readinessPercent = Math.min(95, resumeUploaded ? 40 + resumeScore * 0.5 : resumeScore * 0.4);

  const statsData = [
    { label: "Applications Sent", value: progress.applied || 0, icon: "send", change: "+12%", hoverBg: "#3525cd" },
    { label: "Interviews Held", value: progress.interview || 0, icon: "calendar_today", change: `Next: Soon`, hoverBg: "#0058be" },
    { label: "Shortlisted", value: progress.shortlisted || 0, icon: "verified", change: progress.selected > 0 ? "Finalist" : "—", hoverBg: "#a44100" },
    { label: "Skill Score", value: resumeScore, icon: "bolt", change: resumeScore > 70 ? 'Top 15%' : 'Growing', hoverBg: "#4f46e5" },
  ];

  return (
    <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Greeting */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d', marginBottom: '0.5rem' }}>
            Welcome back, {name}.
          </h2>
          <p style={{ color: '#464555', fontSize: '1.0625rem', maxWidth: '36rem', lineHeight: 1.7 }}>
            {latestCompany ? `Your latest analysis for ${latestCompany} is ready. Keep sharpening your skills!` : 'Your placement journey at a glance. Upload a resume to get started.'}
          </p>
        </div>

        {/* Readiness Ring */}
        <div style={{ width: '100%', maxWidth: '18rem', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: vignetteShadow, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="relative" style={{ width: '7rem', height: '7rem', marginBottom: '1rem' }}>
            <svg className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="56" cy="56" r="48" fill="transparent" stroke="#e2dfff" strokeWidth="8" />
              <circle cx="56" cy="56" r="48" fill="transparent" stroke="#3525cd" strokeWidth="8"
                strokeDasharray={`${301.59}`}
                strokeDashoffset={`${301.59 * (1 - readinessPercent / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3525cd' }}>{Math.round(readinessPercent)}%</span>
              <span style={{ fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, color: '#777587' }}>Ready</span>
            </div>
          </div>
          <h3 style={{ fontWeight: 700, color: '#191c1d', fontSize: '0.875rem' }}>Placement Readiness</h3>
          <p style={{ fontSize: '0.75rem', color: '#464555', marginTop: '0.25rem' }}>
            {resumeUploaded ? "Resume uploaded. Keep applying!" : "Upload your resume to boost readiness."}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: vignetteShadow,
              transition: 'all 0.3s',
              cursor: 'default',
            }}
          >
            <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#e2dfff', borderRadius: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#3525cd' }}>{stat.icon}</span>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#0058be', backgroundColor: '#d8e2ff', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                {stat.change}
              </span>
            </div>
            <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#191c1d' }}>{stat.value}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#464555' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Latest Analysis Banner */}
      {latestCompany && (
        <div style={{
          borderRadius: '0.75rem',
          padding: '1.5rem',
          backgroundColor: eligible ? '#e2dfff' : '#ffdbcc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#464555' }}>Latest Analysis</p>
            <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#191c1d', marginTop: '0.25rem' }}>
              {latestCompany} — {latestRole}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '2rem', fontWeight: 900, color: '#191c1d' }}>{overallScore}%</p>
            <span style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: eligible ? '#3525cd' : '#a44100',
              color: '#ffffff',
            }}>
              {eligible ? '✓ Eligible' : '✗ Not Eligible'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Skills Matrix */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #edeeef' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#191c1d' }}>
                Intelligent Skill Matrix
              </h3>
            </div>
            <div style={{ padding: '2rem' }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '1rem' }}>
                  Current Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? skills.map((s) => (
                    <span key={s} style={{ padding: '0.375rem 0.75rem', backgroundColor: '#e2dfff', color: '#3525cd', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px', border: '1px solid rgba(53,37,205,0.1)' }}>
                      {s}
                    </span>
                  )) : (
                    <p style={{ color: '#777587', fontSize: '0.875rem' }}>Upload a resume to extract skills.</p>
                  )}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '1rem' }}>
                  Skill Gaps
                </h4>
                {missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((s) => (
                      <span key={s} style={{ padding: '0.375rem 0.75rem', backgroundColor: '#ffdbcc', color: '#7e3000', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#777587', fontSize: '0.875rem' }}>No gaps detected yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #edeeef' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#191c1d' }}>
                Recent Applications
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {appliedCompanies.length === 0 ? (
                <p style={{ color: '#777587', fontSize: '0.875rem', padding: '1rem 0' }}>Apply to companies to see them here.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {appliedCompanies.slice(0, 5).map((company, idx) => (
                    <div
                      key={`${company.name}-${idx}`}
                      className="flex items-center justify-between"
                      style={{
                        padding: '0.875rem 1rem',
                        borderRadius: '0.75rem',
                        backgroundColor: '#f8f9fa',
                        transition: 'background 0.2s',
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 600, color: '#191c1d', fontSize: '0.875rem' }}>{company.name}</p>
                        {company.role && <p style={{ fontSize: '0.75rem', color: '#464555' }}>{company.role}</p>}
                      </div>
                      <span style={badgeStyle(company.status)}>{company.status || "applied"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* AI Improvement Plan */}
          <div style={{ backgroundColor: '#edeeef', borderRadius: '1rem', padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ color: '#3525cd', fontSize: '1.125rem', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              AI Improvement Plan
            </h4>
            {improvementSuggestions.length === 0 ? (
              <p style={{ color: '#777587', fontSize: '0.875rem' }}>Upload your resume to get suggestions.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {improvementSuggestions.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div style={{ flexShrink: 0, width: '2rem', height: '2rem', borderRadius: '9999px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3525cd', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: 700, fontSize: '0.75rem' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#191c1d' }}>{item.skill || 'Suggestion'}</p>
                      <p style={{ fontSize: '0.75rem', color: '#464555', lineHeight: 1.6, marginTop: '0.25rem' }}>{item.howToImprove || item.importance || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Missing Skills with Prep Links */}
          {missingSkillsWithResources.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff' }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.0625rem', fontWeight: 700 }}>Preparation Resources</h3>
                <p style={{ color: '#c7c4d8', fontSize: '0.75rem', marginTop: '0.25rem' }}>Bridge your skill gaps</p>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {missingSkillsWithResources.map((item) => (
                  <div key={item.skill} className="flex items-center justify-between" style={{ padding: '0.75rem', borderRadius: '0.75rem', backgroundColor: '#f8f9fa' }}>
                    <span style={{ fontWeight: 600, color: '#191c1d', fontSize: '0.8125rem' }}>{item.skill}</span>
                    <a
                      href={item.prepLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1"
                      style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#3525cd', textDecoration: 'none' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>open_in_new</span>
                      {item.prepLabel || "Learn"}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Card */}
          <div style={{
            backgroundColor: '#4f46e5',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            color: '#ffffff',
            boxShadow: '0 10px 25px -5px rgba(79,70,229,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div className="absolute" style={{ right: '-2rem', bottom: '-2rem', width: '8rem', height: '8rem', background: 'rgba(255,255,255,0.1)', borderRadius: '9999px', filter: 'blur(40px)' }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined">rocket_launch</span>
              Quick Actions
            </h3>
            <p style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '1rem' }}>
              Continue building your placement profile
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/student/upload" style={{ display: 'block', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', backdropFilter: 'blur(10px)', color: '#fff', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
                📄 Upload Resume
              </a>
              <a href="/student/companies" style={{ display: 'block', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '0.5rem', backdropFilter: 'blur(10px)', color: '#fff', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
                🏢 Browse Companies
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
