import React, { useEffect, useState } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const badgeStyle = (status) => {
  const base = { fontSize: '0.625rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '0.375rem', textTransform: 'uppercase' };
  switch (status) {
    case "selected": return { ...base, backgroundColor: '#e2dfff', color: '#3525cd' };
    case "interview": return { ...base, backgroundColor: '#ffdbcc', color: '#7e3000' };
    case "shortlisted": return { ...base, backgroundColor: '#d8e2ff', color: '#0058be' };
    case "rejected": return { ...base, backgroundColor: '#ffdad6', color: '#ba1a1a' };
    default: return { ...base, backgroundColor: '#edeeef', color: '#464555' };
  }
};

const StudentResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try { const res = await api.get("/student/results"); setResults(res.data); }
      catch (err) { setError(err.response?.data?.message || err.message || "Failed to load results"); }
      finally { setLoading(false); }
    };
    fetchResults();
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
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load results</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a', marginTop: '0.25rem' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Application Results</h1>
        <p style={{ color: '#464555', marginTop: '0.375rem' }}>Track the status of your company applications.</p>
      </div>

      {results.length === 0 ? (
        <div style={{ borderRadius: '0.75rem', backgroundColor: '#ffffff', boxShadow: vignetteShadow, padding: '3rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c7c4d8', display: 'block', marginBottom: '0.75rem' }}>assignment_turned_in</span>
          <p style={{ fontWeight: 600, color: '#464555' }}>No applications yet</p>
          <p style={{ fontSize: '0.875rem', color: '#777587', marginTop: '0.25rem' }}>Apply to companies to see your status here.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #edeeef' }}>
                  {['Company', 'Role', 'Status', 'Applied At'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', padding: '1rem 1.5rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={`${row.name}-${row.role}-${idx}`} style={{ borderBottom: '1px solid #f8f9fa', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#191c1d', fontSize: '0.875rem' }}>{row.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: '#464555', fontSize: '0.875rem' }}>{row.role}</td>
                    <td style={{ padding: '1rem 1.5rem' }}><span style={badgeStyle(row.status || "applied")}>{row.status || "Applied"}</span></td>
                    <td style={{ padding: '1rem 1.5rem', color: '#777587', fontSize: '0.8125rem' }}>{row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResult;
