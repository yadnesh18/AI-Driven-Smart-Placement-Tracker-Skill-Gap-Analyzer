import React, { useEffect, useState } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const StudentRoadmap = () => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [legacyRoadmap, setLegacyRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [skillRadar, setSkillRadar] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roadmapRes, radarRes] = await Promise.allSettled([
          api.get("/student/roadmap"), api.get("/student/analysis/skill-radar"),
        ]);
        if (roadmapRes.status === "fulfilled") setLegacyRoadmap(roadmapRes.value.data || []);
        if (radarRes.status === "fulfilled") setSkillRadar(radarRes.value.data);
      } catch (err) { setError(err.message || "Failed to load roadmap"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!skillRadar || !skillRadar.missingSkills?.length) {
      alert("No missing skills found. Run an analysis against a company first."); return;
    }
    setGenerating(true); setError(null);
    try {
      const res = await api.post("/student/analysis/roadmap", {
        missingSkills: skillRadar.missingSkills, targetCompany: skillRadar.latestCompany || "",
        targetRole: skillRadar.latestRole || "", currentScore: skillRadar.overallScore || 0, timelineWeeks: 8,
      });
      setRoadmapData(res.data);
    } catch (err) { setError(err.response?.data?.message || err.message || "Failed to generate roadmap"); }
    finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid #e2dfff', borderTopColor: '#3525cd', borderRadius: '9999px' }} />
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3" style={{ borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#ffdad6' }}>
      <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>error</span>
      <div>
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load roadmap</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a' }}>{error}</p>
      </div>
    </div>
  );

  const weeks = roadmapData?.roadmap || [];
  const hasPersonalisedRoadmap = weeks.length > 0;

  const renderTimeline = (items, isWeekly) => (
    <div className="relative">
      <div className="absolute" style={{ left: '1.375rem', top: 0, bottom: 0, width: '2px', borderLeft: '2px dashed #c7c4d8' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {items.map((item, idx) => {
          const isComplete = isWeekly && idx === 0;
          const isCurrent = isWeekly && idx === 1;
          return (
            <div key={idx} className="relative flex gap-6" style={{ paddingBottom: '2rem' }}>
              <div className="relative z-10 flex-shrink-0 flex items-center justify-center" style={{
                width: '2.75rem', height: '2.75rem', borderRadius: '1rem',
                background: isComplete ? '#3525cd' : isCurrent ? '#ffffff' : '#e7e8e9',
                border: isCurrent ? '2px solid #3525cd' : 'none', color: isComplete ? '#fff' : isCurrent ? '#3525cd' : '#777587',
                boxShadow: isComplete || isCurrent ? '0 4px 14px -3px rgba(53,37,205,0.2)' : 'none',
                fontWeight: 700, fontSize: '0.8125rem',
              }}>
                {isComplete ? <span className="material-symbols-outlined" style={{ fontSize: '1.125rem', fontVariationSettings: "'FILL' 1" }}>check</span>
                  : isWeekly ? `W${item.week || idx + 1}` : idx + 1}
              </div>
              <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem', opacity: !isWeekly || idx < 3 ? 1 : 0.6, transition: 'box-shadow 0.2s' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#191c1d' }}>{item.title}</h3>
                    {isWeekly && item.skill && (
                      <span style={{ display: 'inline-block', marginTop: '0.375rem', padding: '0.125rem 0.625rem', borderRadius: '9999px', backgroundColor: '#e2dfff', color: '#3525cd', fontSize: '0.75rem', fontWeight: 600 }}>{item.skill}</span>
                    )}
                  </div>
                  {isWeekly && item.estimatedHours && (
                    <div className="flex items-center gap-1" style={{ color: '#777587', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>schedule</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{item.estimatedHours}h</span>
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#464555', marginTop: '0.75rem', lineHeight: 1.6 }}>{item.description}</p>
                {isWeekly && (item.topics || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5" style={{ marginTop: '0.75rem' }}>
                    {item.topics.map((t) => (<span key={t} style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', backgroundColor: '#edeeef', color: '#464555', fontSize: '0.75rem' }}>{t}</span>))}
                  </div>
                )}
                {isWeekly && (item.resources || []).length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>Resources</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {item.resources.map((r, rIdx) => (
                        <a key={rIdx} href={r.url} target="_blank" rel="noreferrer" className="flex items-center justify-between"
                          style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8f9fa', textDecoration: 'none', transition: 'background 0.2s', fontSize: '0.8125rem', color: '#191c1d' }}>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#777587' }}>menu_book</span>
                            <span>{r.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {r.type && <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: r.type === 'free' ? '#e2dfff' : '#ffdbcc', color: r.type === 'free' ? '#3525cd' : '#7e3000' }}>{r.type}</span>}
                            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem', color: '#c7c4d8' }}>open_in_new</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {isWeekly && (item.practiceLinks || []).length > 0 && (
                  <div className="flex flex-wrap gap-3" style={{ marginTop: '0.75rem' }}>
                    {item.practiceLinks.map((l, pIdx) => (
                      <a key={pIdx} href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-1"
                        style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3525cd', textDecoration: 'none' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>open_in_new</span> {l.title}
                      </a>
                    ))}
                  </div>
                )}
                {!isWeekly && item.url && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1" style={{ marginTop: '0.75rem', fontSize: '0.8125rem', fontWeight: 600, color: '#3525cd', textDecoration: 'none' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>open_in_new</span> Learn more
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Learning Roadmap</h1>
          <p style={{ color: '#464555', marginTop: '0.375rem' }}>
            {roadmapData?.summary || "Get a personalised week-by-week plan to close skill gaps."}
          </p>
        </div>
        <button onClick={handleGenerateRoadmap} disabled={generating} className="flex items-center gap-2"
          style={{ padding: '0.625rem 1.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #3525cd, #4f46e5)', color: '#ffffff', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px -3px rgba(53,37,205,0.3)', opacity: generating ? 0.5 : 1, transition: 'all 0.2s' }}>
          {generating ? <><div className="animate-spin" style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '9999px' }} /> Generating…</> :
            <><span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>rocket_launch</span> Generate Roadmap</>}
        </button>
      </div>

      {roadmapData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ v: roadmapData.totalWeeks, l: 'Weeks', icon: 'date_range' }, { v: roadmapData.totalHours, l: 'Total Hours', icon: 'schedule' }, { v: roadmapData.generatedFor?.missingSkills?.length || 0, l: 'Skills to Close', icon: 'target' }].map(({ v, l, icon }) => (
            <div key={l} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.25rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#3525cd', fontSize: '1.5rem', marginBottom: '0.25rem', display: 'block' }}>{icon}</span>
              <p style={{ fontSize: '1.875rem', fontWeight: 900, color: '#191c1d' }}>{v}</p>
              <p style={{ fontSize: '0.8125rem', color: '#464555', marginTop: '0.25rem' }}>{l}</p>
            </div>
          ))}
        </div>
      )}

      {hasPersonalisedRoadmap ? renderTimeline(weeks, true)
        : legacyRoadmap.length > 0 ? renderTimeline(legacyRoadmap, false)
        : (
          <div style={{ borderRadius: '0.75rem', backgroundColor: '#ffffff', boxShadow: vignetteShadow, padding: '3rem', textAlign: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c7c4d8', display: 'block', marginBottom: '0.75rem' }}>route</span>
            <p style={{ fontWeight: 600, color: '#464555' }}>No roadmap yet</p>
            <p style={{ fontSize: '0.875rem', color: '#777587', marginTop: '0.25rem' }}>Upload your resume and run an analysis, then click 'Generate Roadmap'.</p>
          </div>
        )}
    </div>
  );
};

export default StudentRoadmap;
