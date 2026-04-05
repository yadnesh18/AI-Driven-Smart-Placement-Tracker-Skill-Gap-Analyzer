import React, { useEffect, useState } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const STATUS_STYLES = {
  pending: { bg: '#edeeef', color: '#464555' },
  invited: { bg: '#d8e2ff', color: '#0058be' },
  selected: { bg: '#e2dfff', color: '#3525cd' },
  rejected: { bg: '#ffdad6', color: '#ba1a1a' },
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companyStudents, setCompanyStudents] = useState(null);
  const [loadingCompanyStudents, setLoadingCompanyStudents] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, compRes] = await Promise.allSettled([api.get("/admin/students"), api.get("/admin/companies")]);
        if (studRes.status === "fulfilled") setStudents(studRes.value.data);
        if (compRes.status === "fulfilled") setCompanies(compRes.value.data.companies || compRes.value.data || []);
        if (studRes.status === "rejected") setError(studRes.reason?.response?.data?.message || "Failed to load students");
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleCompanyFilter = async (companyId) => {
    setSelectedCompanyId(companyId);
    if (!companyId) { setCompanyStudents(null); return; }
    setLoadingCompanyStudents(true);
    try { const res = await api.get(`/admin/students/by-company?companyId=${companyId}`); setCompanyStudents(res.data); }
    catch (err) { alert(err.response?.data?.message || "Failed to load students"); setCompanyStudents(null); }
    finally { setLoadingCompanyStudents(false); }
  };

  const handleAction = async (action, studentId, companyId, message) => {
    setActionLoading(`${action}-${studentId}`); setActionSuccess(null);
    try {
      await api.post(`/admin/students/${studentId}/${action}`, { companyId, message });
      setActionSuccess(`Student ${action === "invite" ? "invited" : action === "select" ? "selected" : "notified"} successfully!`);
      if (selectedCompanyId) handleCompanyFilter(selectedCompanyId);
    } catch (err) { alert(err.response?.data?.message || `Failed to ${action} student`); }
    finally { setActionLoading(null); }
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
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load students</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a' }}>{error}</p>
      </div>
    </div>
  );

  const displayList = companyStudents ? companyStudents.students : students;
  const filtered = displayList.filter((s) => {
    const q = search.toLowerCase();
    return !q || (s.name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Students</h1>
        <p style={{ color: '#464555', marginTop: '0.375rem', fontSize: '0.875rem' }}>View eligibility per company. Invite, select, or reject students.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ color: '#777587', fontSize: '1.125rem' }}>filter_list</span>
          <select value={selectedCompanyId} onChange={(e) => handleCompanyFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #c7c4d8', backgroundColor: '#ffffff', fontSize: '0.8125rem', color: '#191c1d', outline: 'none' }}>
            <option value="">All Students</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>{c.name} — {c.role}{c.totalApplicants !== undefined ? ` (${c.totalApplicants})` : ""}</option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 w-full" style={{ maxWidth: '20rem' }}>
          <span className="material-symbols-outlined absolute" style={{ left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: '1.125rem' }}>search</span>
          <input type="text" placeholder="Search name or email…" value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '0.5rem', border: '1px solid #c7c4d8', backgroundColor: '#ffffff', fontSize: '0.8125rem', color: '#191c1d', outline: 'none' }} />
        </div>
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.8125rem', color: '#777587' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>group</span>
          {filtered.length} students
        </div>
      </div>

      {/* Company Summary */}
      {companyStudents && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { v: companyStudents.summary?.total || 0, l: 'Total Analyzed', icon: 'analytics' },
            { v: companyStudents.summary?.eligible || 0, l: 'Eligible', icon: 'verified', accent: '#006e28' },
            { v: companyStudents.summary?.notEligible || 0, l: 'Not Eligible', icon: 'block', accent: '#ba1a1a' },
          ].map(({ v, l, icon, accent }) => (
            <div key={l} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.25rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: accent || '#3525cd', fontSize: '1.5rem', display: 'block', marginBottom: '0.25rem' }}>{icon}</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: accent || '#191c1d' }}>{v}</p>
              <p style={{ fontSize: '0.8125rem', color: '#464555' }}>{l}</p>
            </div>
          ))}
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center gap-3" style={{ borderRadius: '0.75rem', padding: '0.875rem 1rem', backgroundColor: '#e2dfff' }}>
          <span className="material-symbols-outlined" style={{ color: '#3525cd' }}>check_circle</span>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#3525cd' }}>{actionSuccess}</p>
        </div>
      )}

      {loadingCompanyStudents ? (
        <div className="flex items-center justify-center" style={{ minHeight: '20vh' }}>
          <div className="animate-spin" style={{ width: '2rem', height: '2rem', border: '3px solid #e2dfff', borderTopColor: '#3525cd', borderRadius: '9999px' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ borderRadius: '0.75rem', backgroundColor: '#ffffff', boxShadow: vignetteShadow, padding: '3rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c7c4d8', display: 'block', marginBottom: '0.75rem' }}>school</span>
          <p style={{ fontWeight: 600, color: '#464555' }}>No students found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((student) => {
            const studentId = student.studentId || student._id;
            const isExpanded = expandedId === studentId;
            const skills = student.matchedSkills || student.skills || [];
            const missingSkills = student.missingSkills || [];
            const score = student.score;
            const eligible = student.eligible;
            const status = student.status || "pending";
            const stStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;

            return (
              <div key={studentId} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden' }}>
                <button type="button" onClick={() => setExpandedId(isExpanded ? null : studentId)}
                  className="w-full flex items-center justify-between"
                  style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}>
                  <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#e2dfff', color: '#3525cd', fontWeight: 700, fontSize: '0.875rem' }}>
                      {(student.name || "?")[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 600, color: '#191c1d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#777587', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {score !== undefined && (
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: eligible ? '#006e28' : '#a44100' }}>{score}%</span>
                    )}
                    {eligible !== undefined && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '0.375rem', backgroundColor: eligible ? '#e2dfff' : '#ffdbcc', color: eligible ? '#3525cd' : '#7e3000' }}>
                        {eligible ? "Eligible" : "Not Eligible"}
                      </span>
                    )}
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '0.375rem', backgroundColor: stStyle.bg, color: stStyle.color }}>{status}</span>
                    <span className="material-symbols-outlined" style={{ color: '#777587', fontSize: '1.125rem' }}>
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid #edeeef', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {skills.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>Matched Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s) => (
                            <span key={s} style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e2dfff', color: '#3525cd' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {missingSkills.length > 0 && (
                      <div>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingSkills.map((s) => (
                            <span key={s} style={{ padding: '0.25rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#ffdbcc', color: '#7e3000' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedCompanyId && (
                      <div className="flex flex-wrap gap-2" style={{ paddingTop: '0.5rem' }}>
                        {[
                          { action: 'invite', label: 'Invite for Interview', icon: 'mail', bg: '#0058be', disabled: status === "invited" || status === "selected" },
                          { action: 'select', label: 'Select', icon: 'check_circle', bg: '#006e28', disabled: status === "selected" },
                          { action: 'reject', label: 'Reject', icon: 'cancel', bg: '#ba1a1a', disabled: status === "rejected" },
                        ].map(({ action, label, icon, bg, disabled }) => (
                          <button key={action} onClick={() => handleAction(action, studentId, selectedCompanyId)}
                            disabled={actionLoading === `${action}-${studentId}` || disabled}
                            className="flex items-center gap-1.5"
                            style={{ padding: '0.5rem 0.875rem', borderRadius: '0.5rem', backgroundColor: bg, color: '#fff', fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled || actionLoading === `${action}-${studentId}` ? 0.5 : 1, transition: 'all 0.2s' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>{icon}</span>
                            {actionLoading === `${action}-${studentId}` ? "…" : label}
                          </button>
                        ))}
                      </div>
                    )}
                    {student.resumeUrl && (
                      <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5"
                        style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#3525cd', textDecoration: 'none' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>description</span>
                        View Resume
                        <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>open_in_new</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
