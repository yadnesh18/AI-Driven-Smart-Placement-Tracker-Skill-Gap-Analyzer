import React, { useState, useCallback, useRef, useEffect } from "react";
import api from "../../services/api";
import {
  Upload as UploadIcon,
  FileText,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Star,
  History,
} from "lucide-react";

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

  // Load resume history on mount
  useEffect(() => {
    loadResumeHistory();
  }, []);

  const loadResumeHistory = async () => {
    try {
      const [histRes, statusRes] = await Promise.allSettled([
        api.get("/student/resume/all"),
        api.get("/student/resume/status"),
      ]);
      if (histRes.status === "fulfilled") {
        setResumeHistory(histRes.value.data.resumes || []);
      }
      if (statusRes.status === "fulfilled" && statusRes.value.data.resumeId) {
        // Load active resume detail
        try {
          const detailRes = await api.get(`/student/resume/${statusRes.value.data.resumeId}`);
          setActiveResumeDetail(detailRes.data);
        } catch {}
      }
    } catch {} finally {
      setLoadingHistory(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setError(null);
      setSuccess(null);
      setUploadResult(null);
    } else {
      setError("Please upload a PDF file only.");
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
        setSuccess(null);
        setUploadResult(null);
      } else {
        setError("Please upload a PDF file only.");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await api.post("/student/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.message || "Resume uploaded successfully!");
      setUploadResult(res.data);
      setFile(null);
      formRef.current?.reset();

      // Refresh history after short delay (background processing)
      setTimeout(() => loadResumeHistory(), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleActivate = async (resumeId) => {
    setActivatingId(resumeId);
    try {
      await api.put(`/student/resume/${resumeId}/activate`);
      await loadResumeHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to activate resume");
    } finally {
      setActivatingId(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Resume</h1>
        <p className="text-slate-500 mt-1">
          Upload your PDF resume to get AI-powered skill analysis. You can upload multiple versions.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 overflow-hidden">
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed p-12 transition-all duration-300 ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-slate-200 bg-slate-50/30 hover:border-indigo-300 hover:bg-indigo-50/20"
          }`}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center pointer-events-none">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-600 mb-4">
              <UploadIcon className="w-10 h-10" strokeWidth={2} />
            </div>
            <p className="text-slate-700 font-semibold">
              {dragActive ? "Drop your PDF here" : "Drag and drop your resume here"}
            </p>
            <p className="text-sm text-slate-500 mt-1">or click to browse</p>
            <p className="text-xs text-slate-400 mt-2">PDF only, max 5MB</p>
          </div>
        </form>

        {file && (
          <div className="mx-6 mb-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading & Analyzing…
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" />
                Upload & Analyze Resume
              </>
            )}
          </button>

          {success && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-emerald-800">{success}</p>
                {uploadResult && (
                  <p className="text-xs text-emerald-600 mt-1">
                    Version {uploadResult.version} • Processing skills in background…
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <p className="font-medium text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Resume Detail (Issue 3) */}
      {activeResumeDetail && (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-800">Active Resume Details</h2>
              <p className="text-sm text-slate-500">
                {activeResumeDetail.filename} • Version {activeResumeDetail.version}
              </p>
            </div>
            {activeResumeDetail.fileUrl && (
              <a
                href={activeResumeDetail.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <ExternalLink className="w-4 h-4" />
                View PDF
              </a>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-slate-800">{activeResumeDetail.score || 0}</span>
              <span className="text-sm text-slate-500">/100</span>
            </div>
            {activeResumeDetail.scoreBreakdown && (
              <p className="text-sm text-slate-600">{activeResumeDetail.scoreBreakdown}</p>
            )}
          </div>

          {/* Extracted Skills */}
          {(activeResumeDetail.extractedSkills || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Extracted Skills ({activeResumeDetail.extractedSkills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {activeResumeDetail.extractedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted From sections */}
          {activeResumeDetail.extractedFrom && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["skillsSection", "projectsSection", "educationSection"].map((section) => {
                const items = activeResumeDetail.extractedFrom[section] || [];
                if (items.length === 0) return null;
                const label = section.replace("Section", "").replace(/([A-Z])/g, " $1").trim();
                return (
                  <div key={section}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      From {label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" />
            Uploaded {new Date(activeResumeDetail.uploadedAt).toLocaleString()}
            <span className={`font-medium px-2 py-0.5 rounded-full ${
              activeResumeDetail.status === "done"
                ? "bg-emerald-50 text-emerald-600"
                : activeResumeDetail.status === "processing"
                ? "bg-amber-50 text-amber-600"
                : "bg-red-50 text-red-600"
            }`}>
              {activeResumeDetail.status}
            </span>
          </div>
        </div>
      )}

      {/* Resume History (Issue 2) */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <History className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-slate-800">Resume History</h3>
              <p className="text-xs text-slate-500">{resumeHistory.length} version{resumeHistory.length !== 1 ? "s" : ""} uploaded</p>
            </div>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showHistory && (
          <div className="border-t border-slate-100 px-6 py-4">
            {loadingHistory ? (
              <p className="text-sm text-slate-400 py-4 text-center">Loading…</p>
            ) : resumeHistory.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No resumes uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {resumeHistory.map((resume) => (
                  <div
                    key={resume.resumeId}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                      resume.isActive ? "border-indigo-200 bg-indigo-50/50" : "border-slate-100 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 text-sm">{resume.filename}</p>
                          {resume.isActive && (
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          v{resume.version} • Score: {resume.score || "—"} • {resume.status}
                          {resume.uploadedAt && ` • ${new Date(resume.uploadedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    {!resume.isActive && (
                      <button
                        onClick={() => handleActivate(resume.resumeId)}
                        disabled={activatingId === resume.resumeId}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
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
