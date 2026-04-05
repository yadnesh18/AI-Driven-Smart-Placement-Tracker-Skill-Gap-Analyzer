import React, { useEffect, useState } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const StudentCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/student/companies");
        setCompanies(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load companies");
      } finally { setLoading(false); }
    };
    fetchCompanies();
  }, []);

  const handleApply = async (companyId) => {
    setApplyingId(companyId);
    try {
      await api.post(`/student/apply/${companyId}`);
      setCompanies((prev) => prev.map((c) => (c._id === companyId ? { ...c, applied: true } : c)));
    } catch (err) { alert(err.response?.data?.message || err.message || "Apply failed"); }
    finally { setApplyingId(null); }
  };

  const handleAnalyze = async (company) => {
    setAnalyzingId(company._id); setAnalysisResult(null);
    try {
      const res = await api.post("/student/analysis/run", { companyId: company._id });
      setAnalysisResult(res.data);
    } catch (err) { alert(err.response?.data?.message || err.message || "Analysis failed."); }
    finally { setAnalyzingId(null); }
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
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load companies</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a', marginTop: '0.25rem' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Companies</h1>
        <p style={{ color: '#464555', marginTop: '0.375rem' }}>Browse companies, run skill analysis, and apply.</p>
      </div>

      {/* Analysis Result */}
      {analysisResult && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: analysisResult.eligible ? '#e2dfff' : '#ffdbcc' }}>
                <span className="material-symbols-outlined" style={{ color: analysisResult.eligible ? '#3525cd' : '#7e3000' }}>target</span>
              </div>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#191c1d' }}>
                  Analysis: {analysisResult.company} — {analysisResult.role}
                </h2>
                <div className="flex items-center gap-3" style={{ marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#191c1d' }}>{analysisResult.score}%</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: analysisResult.eligible ? '#3525cd' : '#a44100', color: '#ffffff' }}>
                    {analysisResult.eligible ? '✓ Eligible' : '✗ Not Eligible'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setAnalysisResult(null)} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: '#777587', background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {analysisResult.scoreReason && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#464555' }}>{analysisResult.scoreReason.summary}</p>
              {(analysisResult.scoreReason.breakdown || []).length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {analysisResult.scoreReason.breakdown.map((cat, idx) => (
                    <div key={idx} style={{ padding: '1rem', borderRadius: '0.75rem', backgroundColor: '#f8f9fa' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#191c1d', fontSize: '0.875rem' }}>{cat.category}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#777587' }}>{cat.earnedWeight}/{cat.weight} pts</span>
                      </div>
                      <div style={{ height: '0.5rem', backgroundColor: '#edeeef', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                        <div style={{ height: '100%', width: `${cat.weight > 0 ? (cat.earnedWeight / cat.weight) * 100 : 0}%`, backgroundColor: '#3525cd', borderRadius: '9999px', transition: 'width 0.5s' }} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(cat.matched || []).map((s) => (
                          <span key={s} style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', backgroundColor: '#e2dfff', color: '#3525cd', fontSize: '0.75rem' }}>✓ {s}</span>
                        ))}
                        {(cat.missing || []).map((s) => (
                          <span key={s} style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', backgroundColor: '#ffdad6', color: '#ba1a1a', fontSize: '0.75rem' }}>✗ {s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(analysisResult.scoreReason.positives || []).length > 0 && (
                  <div style={{ borderRadius: '0.75rem', padding: '1rem', backgroundColor: '#e2dfff' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#3525cd', marginBottom: '0.5rem' }}>Strengths</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {analysisResult.scoreReason.positives.map((p, i) => (
                        <li key={i} className="flex items-start gap-2" style={{ fontSize: '0.8125rem', color: '#191c1d' }}>
                          <span className="material-symbols-outlined" style={{ color: '#3525cd', fontSize: '1rem', marginTop: '0.125rem' }}>check_circle</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(analysisResult.scoreReason.improvements || []).length > 0 && (
                  <div style={{ borderRadius: '0.75rem', padding: '1rem', backgroundColor: '#ffdbcc' }}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#7e3000', marginBottom: '0.5rem' }}>Areas to Improve</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {analysisResult.scoreReason.improvements.map((p, i) => (
                        <li key={i} className="flex items-start gap-2" style={{ fontSize: '0.8125rem', color: '#191c1d' }}>
                          <span className="material-symbols-outlined" style={{ color: '#7e3000', fontSize: '1rem', marginTop: '0.125rem' }}>warning</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {companies.length === 0 ? (
        <div style={{ borderRadius: '0.75rem', backgroundColor: '#ffffff', boxShadow: vignetteShadow, padding: '3rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c7c4d8', marginBottom: '0.75rem', display: 'block' }}>business</span>
          <p style={{ fontWeight: 600, color: '#464555' }}>No companies yet</p>
          <p style={{ fontSize: '0.875rem', color: '#777587', marginTop: '0.25rem' }}>Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company._id} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s' }}>
              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div className="flex items-start justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 700, color: '#191c1d', fontSize: '1rem' }}>{company.name}</h3>
                    <p style={{ fontSize: '0.8125rem', color: '#464555' }}>{company.role}</p>
                  </div>
                  {company.package && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3525cd', backgroundColor: '#e2dfff', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
                      {company.package} LPA
                    </span>
                  )}
                </div>
                {company.location && (
                  <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', color: '#777587', marginBottom: '0.5rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>location_on</span>
                    {company.location}
                  </div>
                )}
                {company.description && (
                  <p style={{ fontSize: '0.8125rem', color: '#464555', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    {company.description.length > 120 ? company.description.substring(0, 120) + '…' : company.description}
                  </p>
                )}
                {(company.requiredSkills || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5" style={{ marginBottom: '0.75rem' }}>
                    {company.requiredSkills.slice(0, 4).map((s) => (
                      <span key={s} style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#e2dfff', color: '#3525cd', fontSize: '0.6875rem', fontWeight: 600 }}>{s}</span>
                    ))}
                    {company.requiredSkills.length > 4 && (
                      <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#edeeef', color: '#777587', fontSize: '0.6875rem', fontWeight: 600 }}>+{company.requiredSkills.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
              <div style={{ padding: '0 1.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleApply(company._id)}
                  disabled={company.applied || applyingId === company._id}
                  style={{
                    flex: 1, padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                    fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: company.applied ? 'default' : 'pointer',
                    backgroundColor: company.applied ? '#edeeef' : '#3525cd', color: company.applied ? '#777587' : '#ffffff',
                    opacity: applyingId === company._id ? 0.5 : 1, transition: 'all 0.2s',
                  }}
                >
                  {company.applied ? '✓ Applied' : applyingId === company._id ? 'Applying…' : 'Apply'}
                </button>
                <button
                  onClick={() => handleAnalyze(company)}
                  disabled={analyzingId === company._id}
                  className="flex items-center justify-center gap-1"
                  style={{
                    flex: 1, padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
                    fontWeight: 600, fontSize: '0.8125rem', border: '1px solid #c7c4d8',
                    backgroundColor: 'transparent', color: '#3525cd', cursor: 'pointer',
                    opacity: analyzingId === company._id ? 0.5 : 1, transition: 'all 0.2s',
                  }}
                >
                  {analyzingId === company._id ? (
                    <><div className="animate-spin" style={{ width: '0.875rem', height: '0.875rem', border: '2px solid #c7c4d8', borderTopColor: '#3525cd', borderRadius: '9999px' }} /> Analyzing…</>
                  ) : (
                    <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>analytics</span> Analyze</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCompanies;
