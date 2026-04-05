import React, { useEffect, useState } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const inputStyle = {
  width: '100%', padding: '0.625rem 0.75rem', backgroundColor: '#edeeef', border: '2px solid transparent',
  borderRadius: '0.5rem', color: '#191c1d', fontSize: '0.8125rem', outline: 'none', transition: 'all 0.2s',
};

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try { const res = await api.get("/admin/companies"); setCompanies(res.data.companies || res.data || []); }
      catch (err) { setError(err.response?.data?.message || err.message || "Failed to load companies"); }
      finally { setLoading(false); }
    };
    fetchCompanies();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company? This cannot be undone.")) return;
    setDeletingId(id);
    try { await api.delete(`/admin/company/${id}`); setCompanies((prev) => prev.filter((c) => c._id !== id)); }
    catch (err) { alert(err.response?.data?.message || err.message || "Failed to delete company"); }
    finally { setDeletingId(null); }
  };

  const startEditing = (company) => {
    setEditingCompany(company._id);
    setEditForm({
      name: company.name || "", role: company.role || "", package: company.package || "",
      requiredSkills: (company.requiredSkills || []).join(", "), description: company.description || "",
      location: company.location || "", deadline: company.deadline ? new Date(company.deadline).toISOString().split("T")[0] : "",
      isActive: company.isActive !== false,
    });
  };

  const cancelEditing = () => { setEditingCompany(null); setEditForm({}); };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      const payload = {
        name: editForm.name, role: editForm.role, package: Number(editForm.package),
        requiredSkills: editForm.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        description: editForm.description, location: editForm.location, deadline: editForm.deadline || undefined,
        isActive: editForm.isActive,
      };
      const res = await api.put(`/companies/${id}`, payload);
      setCompanies((prev) => prev.map((c) => (c._id === id ? { ...c, ...res.data } : c)));
      setEditingCompany(null);
    } catch (err) { alert(err.response?.data?.message || err.message || "Failed to update company"); }
    finally { setSaving(false); }
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
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a' }}>{error}</p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Manage Companies</h1>
        <p style={{ color: '#464555', marginTop: '0.375rem' }}>View, edit, and manage all companies.</p>
      </div>

      {companies.length === 0 ? (
        <div style={{ borderRadius: '0.75rem', backgroundColor: '#ffffff', boxShadow: vignetteShadow, padding: '3rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c7c4d8', display: 'block', marginBottom: '0.75rem' }}>business</span>
          <p style={{ fontWeight: 600, color: '#464555' }}>No companies yet</p>
          <p style={{ fontSize: '0.875rem', color: '#777587', marginTop: '0.25rem' }}>Add companies from the Add Company page.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {companies.map((company) => {
            const isEditing = editingCompany === company._id;
            return (
              <div key={company._id} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem', transition: 'all 0.2s' }}>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Company Name', key: 'name', type: 'text' },
                        { label: 'Role', key: 'role', type: 'text' },
                        { label: 'Package (LPA)', key: 'package', type: 'number' },
                        { label: 'Location', key: 'location', type: 'text' },
                        { label: 'Deadline', key: 'deadline', type: 'date' },
                      ].map(({ label, key, type }) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.375rem' }}>{label}</label>
                          <input type={type} value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} style={inputStyle} />
                        </div>
                      ))}
                      <div className="flex items-center gap-2" style={{ paddingTop: '1.5rem' }}>
                        <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} style={{ accentColor: '#3525cd' }} />
                        <label style={{ fontSize: '0.875rem', color: '#464555' }}>Active</label>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.375rem' }}>Required Skills (comma separated)</label>
                      <input type="text" value={editForm.requiredSkills} onChange={(e) => setEditForm({ ...editForm, requiredSkills: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.375rem' }}>Description</label>
                      <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'none' }} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleSaveEdit(company._id)} disabled={saving} className="flex items-center gap-2"
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: '#3525cd', color: '#fff', fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span> {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEditing} className="flex items-center gap-2"
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#464555', fontWeight: 600, fontSize: '0.8125rem', border: '1px solid #c7c4d8', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="flex items-center gap-3">
                        <h3 style={{ fontWeight: 700, color: '#191c1d' }}>{company.name}</h3>
                        {!company.isActive && company.isActive !== undefined && (
                          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#ba1a1a', backgroundColor: '#ffdad6', padding: '0.125rem 0.5rem', borderRadius: '0.375rem' }}>Inactive</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#464555', marginTop: '0.25rem' }}>{company.role} · {typeof company.package === "number" ? `${company.package} LPA` : "-"}</p>
                      {company.location && (
                        <div className="flex items-center gap-1" style={{ color: '#777587', marginTop: '0.375rem', fontSize: '0.75rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>location_on</span> {company.location}
                        </div>
                      )}
                      <div className="flex items-center gap-4" style={{ marginTop: '0.5rem' }}>
                        <div className="flex items-center gap-1.5" style={{ fontSize: '0.8125rem' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#777587' }}>group</span>
                          <span style={{ fontWeight: 600, color: '#191c1d' }}>{company.totalApplicants || 0}</span>
                          <span style={{ color: '#777587' }}>analyzed</span>
                        </div>
                        {company.eligibleCount > 0 && (
                          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#006e28', backgroundColor: '#dcfce7', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>
                            {company.eligibleCount} eligible
                          </span>
                        )}
                      </div>
                      {(company.requiredSkills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1" style={{ marginTop: '0.5rem' }}>
                          {company.requiredSkills.map((s) => (
                            <span key={s} style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: '#e2dfff', color: '#3525cd', fontSize: '0.6875rem', fontWeight: 600 }}>{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                      <button onClick={() => startEditing(company)} className="flex items-center gap-1.5"
                        style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#e2dfff', color: '#3525cd', fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span> Edit
                      </button>
                      <button onClick={() => handleDelete(company._id)} disabled={deletingId === company._id} className="flex items-center gap-1.5"
                        style={{ padding: '0.375rem 0.75rem', borderRadius: '0.5rem', backgroundColor: '#ffdad6', color: '#ba1a1a', fontWeight: 600, fontSize: '0.8125rem', border: 'none', cursor: 'pointer', opacity: deletingId === company._id ? 0.5 : 1, transition: 'all 0.2s' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span> {deletingId === company._id ? "…" : "Delete"}
                      </button>
                    </div>
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

export default AdminCompanies;
