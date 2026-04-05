import React, { useState } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const inputStyle = {
  width: '100%', padding: '0.875rem 1rem', backgroundColor: '#edeeef', border: '2px solid transparent',
  borderRadius: '0.75rem', color: '#191c1d', fontSize: '0.875rem', fontWeight: 500, outline: 'none',
  transition: 'all 0.2s',
};

const AdminAddCompany = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [pkg, setPkg] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(null); setSuccess(null);
    const parsedPackage = Number(pkg);
    if (!name || !role || Number.isNaN(parsedPackage)) {
      setError("Name, role and numeric package are required."); return;
    }
    const requiredSkills = skills.split(",").map((s) => s.trim()).filter(Boolean);
    setLoading(true);
    try {
      await api.post("/admin/company", { name, role, package: parsedPackage, requiredSkills, description, location, deadline: deadline || undefined });
      setSuccess("Company added successfully.");
      setName(""); setRole(""); setPkg(""); setSkills(""); setDescription(""); setLocation(""); setDeadline("");
    } catch (err) { setError(err.response?.data?.message || err.message || "Failed to add company"); }
    finally { setLoading(false); }
  };

  const fields = [
    { label: "Company Name", value: name, set: setName, type: "text", placeholder: "Google", icon: "business" },
    { label: "Role", value: role, set: setRole, type: "text", placeholder: "Software Engineer", icon: "work" },
    { label: "Package (LPA)", value: pkg, set: setPkg, type: "number", placeholder: "24", icon: "payments" },
    { label: "Location", value: location, set: setLocation, type: "text", placeholder: "Bangalore, India", icon: "location_on" },
    { label: "Deadline", value: deadline, set: setDeadline, type: "date", placeholder: "", icon: "calendar_today" },
  ];

  return (
    <div style={{ maxWidth: '40rem', padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Add Company</h1>
        <p style={{ color: '#464555', marginTop: '0.375rem' }}>Create a new company opening for students to apply.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map(({ label, value, set, type, placeholder, icon }) => (
            <div key={label}>
              <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.375rem' }}>{label}</label>
              <div className="relative">
                <input
                  type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(53,37,205,0.1)'; e.target.style.backgroundColor = '#ffffff'; }}
                  onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#edeeef'; }}
                />
                <div className="absolute flex items-center" style={{ right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#c7c4d8' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>{icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.375rem' }}>Required Skills (comma separated)</label>
          <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="DSA, JavaScript, React"
            style={inputStyle}
            onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(53,37,205,0.1)'; e.target.style.backgroundColor = '#ffffff'; }}
            onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#edeeef'; }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.375rem' }}>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            placeholder="Short description of the role and expectations."
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(53,37,205,0.1)'; e.target.style.backgroundColor = '#ffffff'; }}
            onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#edeeef'; }} />
        </div>

        {error && (
          <div className="flex items-center gap-3" style={{ borderRadius: '0.75rem', padding: '0.875rem 1rem', backgroundColor: '#ffdad6' }}>
            <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>error</span>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#93000a' }}>{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3" style={{ borderRadius: '0.75rem', padding: '0.875rem 1rem', backgroundColor: '#e2dfff' }}>
            <span className="material-symbols-outlined" style={{ color: '#3525cd' }}>check_circle</span>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#3525cd' }}>{success}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="flex items-center gap-2"
          style={{
            padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)',
            color: '#ffffff', fontWeight: 600, fontSize: '0.875rem', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
            boxShadow: '0 4px 14px -3px rgba(53,37,205,0.3)', transition: 'all 0.2s',
          }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add_business</span>
          {loading ? "Saving…" : "Add Company"}
        </button>
      </form>
    </div>
  );
};

export default AdminAddCompany;
