import React, { useState, useCallback, useRef, useEffect } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const StudentUpload = () => {
  const formRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [activeResumeDetail, setActiveResumeDetail] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [activatingId, setActivatingId] = useState(null);

  useEffect(() => { loadResumeHistory(); }, []);

  const loadResumeHistory = async () => {
    try {
      const [histRes, statusRes] = await Promise.allSettled([
        api.get("/student/resume/all"),
        api.get("/student/resume/status"),
      ]);
      if (histRes.status === "fulfilled") setResumeHistory(histRes.value.data.resumes || []);
      if (statusRes.status === "fulfilled" && statusRes.value.data.resumeId) {
        try {
          const detailRes = await api.get(`/student/resume/${statusRes.value.data.resumeId}`);
          setActiveResumeDetail(detailRes.data);
        } catch {}
      }
    } catch {} finally { setLoadingHistory(false); }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile); setError(null); setSuccess(null); setUploadResult(null);
    } else { setError("Please upload a PDF file only."); }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile); setError(null); setSuccess(null); setUploadResult(null);
      } else { setError("Please upload a PDF file only."); setFile(null); }
    }
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select a file first."); return; }
    setUploading(true); setError(null); setSuccess(null); setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/student/upload-resume", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess(res.data.message || "Resume uploaded successfully!");
      setUploadResult(res.data); setFile(null); formRef.current?.reset();
      setTimeout(() => loadResumeHistory(), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const handleActivate = async (resumeId) => {
    setActivatingId(resumeId);
    try { await api.put(`/student/resume/${resumeId}/activate`); await loadResumeHistory(); }
    catch (err) { alert(err.response?.data?.message || "Failed to activate resume"); }
    finally { setActivatingId(null); }
  };

  const removeFile = () => { setFile(null); setError(null); setSuccess(null); };

  return (
    <div style={{ maxWidth: '56rem', padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>
          Resume Analyzer
        </h1>
        <p style={{ color: '#464555', marginTop: '0.375rem', fontSize: '1rem' }}>
          Upload your PDF resume to get AI-powered skill analysis. You can upload multiple versions.
        </p>
      </div>

      {/* Upload Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden' }}>
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="relative"
          style={{
            borderRadius: '0.75rem',
            border: `2px dashed ${dragActive ? '#3525cd' : '#c7c4d8'}`,
            padding: '3rem',
            margin: '1.5rem',
            transition: 'all 0.3s',
            backgroundColor: dragActive ? '#e2dfff' : '#f8f9fa',
          }}
        >
          <input type="file" accept="application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="text-center" style={{ pointerEvents: 'none' }}>
            <div className="inline-flex items-center justify-center" style={{ width: '5rem', height: '5rem', borderRadius: '1rem', backgroundColor: '#e2dfff', marginBottom: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#3525cd' }}>upload_file</span>
            </div>
            <p style={{ color: '#191c1d', fontWeight: 600 }}>
              {dragActive ? "Drop your PDF here" : "Drag and drop your resume here"}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#464555', marginTop: '0.25rem' }}>or click to browse</p>
            <p style={{ fontSize: '0.75rem', color: '#777587', marginTop: '0.5rem' }}>PDF only, max 5MB</p>
          </div>
        </form>

        {/* File preview */}
        {file && (
          <div className="flex items-center justify-between" style={{ margin: '0 1.5rem 1.5rem', padding: '0.875rem 1rem', borderRadius: '0.75rem', backgroundColor: '#f8f9fa' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center" style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', backgroundColor: '#ffdad6' }}>
                <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>description</span>
              </div>
              <div>
                <p style={{ fontWeight: 500, color: '#191c1d', fontSize: '0.875rem' }}>{file.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#777587' }}>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button type="button" onClick={removeFile} style={{ padding: '0.5rem', borderRadius: '0.5rem', color: '#777587', background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Upload button */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full flex items-center justify-center gap-2"
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)',
              color: '#ffffff',
              fontWeight: 600,
              border: 'none',
              cursor: !file || uploading ? 'not-allowed' : 'pointer',
              opacity: !file || uploading ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px -3px rgba(53,37,205,0.3)',
            }}
          >
            {uploading ? (
              <>
                <div className="animate-spin" style={{ width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '9999px' }} />
                Uploading & Analyzing…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>psychology</span>
                Upload & Analyze Resume
              </>
            )}
          </button>

          {/* Success */}
          {success && (
            <div className="flex items-center gap-3" style={{ marginTop: '1rem', borderRadius: '0.75rem', padding: '0.875rem 1rem', backgroundColor: '#e2dfff' }}>
              <span className="material-symbols-outlined" style={{ color: '#3525cd' }}>check_circle</span>
              <div>
                <p style={{ fontWeight: 500, color: '#3525cd', fontSize: '0.875rem' }}>{success}</p>
                {uploadResult && <p style={{ fontSize: '0.75rem', color: '#464555', marginTop: '0.25rem' }}>Version {uploadResult.version} • Processing skills in background…</p>}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3" style={{ marginTop: '1rem', borderRadius: '0.75rem', padding: '0.875rem 1rem', backgroundColor: '#ffdad6' }}>
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>error</span>
              <p style={{ fontWeight: 500, color: '#93000a', fontSize: '0.875rem' }}>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Resume Detail */}
      {activeResumeDetail && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#e2dfff' }}>
              <span className="material-symbols-outlined" style={{ color: '#3525cd', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#191c1d' }}>Active Resume Details</h2>
              <p style={{ fontSize: '0.8125rem', color: '#464555' }}>{activeResumeDetail.filename} • Version {activeResumeDetail.version}</p>
            </div>
            {activeResumeDetail.fileUrl && (
              <a href={activeResumeDetail.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1"
                style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#3525cd', textDecoration: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>open_in_new</span> View PDF
              </a>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#191c1d' }}>{activeResumeDetail.score || 0}</span>
            <span style={{ fontSize: '0.875rem', color: '#777587' }}>/100</span>
            {activeResumeDetail.scoreBreakdown && <p style={{ fontSize: '0.8125rem', color: '#464555' }}>{activeResumeDetail.scoreBreakdown}</p>}
          </div>

          {/* Extracted Skills */}
          {(activeResumeDetail.extractedSkills || []).length > 0 && (
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>
                Extracted Skills ({activeResumeDetail.extractedSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {activeResumeDetail.extractedSkills.map((skill) => (
                  <span key={skill} style={{ padding: '0.375rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#e2dfff', color: '#3525cd', border: '1px solid rgba(53,37,205,0.1)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted From */}
          {activeResumeDetail.extractedFrom && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["skillsSection", "projectsSection", "educationSection"].map((section) => {
                const items = activeResumeDetail.extractedFrom[section] || [];
                if (items.length === 0) return null;
                const label = section.replace("Section", "").replace(/([A-Z])/g, " $1").trim();
                return (
                  <div key={section}>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.375rem' }}>
                      From {label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((s) => (
                        <span key={s} style={{ padding: '0.125rem 0.5rem', borderRadius: '0.375rem', backgroundColor: '#d8e2ff', color: '#0058be', fontSize: '0.75rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3" style={{ fontSize: '0.75rem', color: '#777587' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>schedule</span>
            Uploaded {new Date(activeResumeDetail.uploadedAt).toLocaleString()}
            <span style={{
              fontWeight: 500,
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: activeResumeDetail.status === "done" ? '#e2dfff' : activeResumeDetail.status === "processing" ? '#ffdbcc' : '#ffdad6',
              color: activeResumeDetail.status === "done" ? '#3525cd' : activeResumeDetail.status === "processing" ? '#7e3000' : '#ba1a1a',
            }}>
              {activeResumeDetail.status}
            </span>
          </div>
        </div>
      )}

      {/* Resume History */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: vignetteShadow, overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between"
          style={{ padding: '1rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#e2dfff' }}>
              <span className="material-symbols-outlined" style={{ color: '#3525cd', fontSize: '1rem' }}>history</span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontWeight: 600, color: '#191c1d', fontSize: '0.875rem' }}>Resume History</h3>
              <p style={{ fontSize: '0.75rem', color: '#777587' }}>{resumeHistory.length} version{resumeHistory.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ color: '#777587' }}>
            {showHistory ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showHistory && (
          <div style={{ borderTop: '1px solid #edeeef', padding: '1rem 1.5rem' }}>
            {loadingHistory ? (
              <p style={{ color: '#777587', fontSize: '0.875rem', padding: '1rem 0', textAlign: 'center' }}>Loading…</p>
            ) : resumeHistory.length === 0 ? (
              <p style={{ color: '#777587', fontSize: '0.875rem', padding: '1rem 0', textAlign: 'center' }}>No resumes uploaded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {resumeHistory.map((resume) => (
                  <div
                    key={resume.resumeId}
                    className="flex items-center justify-between"
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '0.75rem',
                      backgroundColor: resume.isActive ? '#e2dfff' : '#f8f9fa',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem', backgroundColor: '#ffdad6' }}>
                        <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>description</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p style={{ fontWeight: 500, color: '#191c1d', fontSize: '0.875rem' }}>{resume.filename}</p>
                          {resume.isActive && (
                            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#3525cd', backgroundColor: 'rgba(53,37,205,0.1)', padding: '0.125rem 0.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '0.75rem' }}>star</span> Active
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#777587' }}>
                          v{resume.version} • Score: {resume.score || "—"} • {resume.status}
                          {resume.uploadedAt && ` • ${new Date(resume.uploadedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    {!resume.isActive && (
                      <button
                        onClick={() => handleActivate(resume.resumeId)}
                        disabled={activatingId === resume.resumeId}
                        style={{
                          fontSize: '0.75rem', fontWeight: 600, color: '#3525cd',
                          padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
                          border: '1px solid #c7c4d8', backgroundColor: 'transparent',
                          cursor: 'pointer', opacity: activatingId === resume.resumeId ? 0.5 : 1,
                          transition: 'all 0.2s',
                        }}
                      >
                        {activatingId === resume.resumeId ? "…" : "Set Active"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentUpload;
