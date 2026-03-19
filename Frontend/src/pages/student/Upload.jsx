import React, { useState, useCallback, useRef } from "react";
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
} from "lucide-react";

const StudentUpload = () => {
  const formRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);

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
      setAnalysisResult(null);
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
        setAnalysisResult(null);
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
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await api.post("/student/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.message || "Resume uploaded successfully!");
      setAnalysisResult(res.data);
      setFile(null);
      formRef.current?.reset();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    setSuccess(null);
  };

  const toggleSuggestion = (idx) => {
    setExpandedSuggestion(expandedSuggestion === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Resume</h1>
        <p className="text-slate-500 mt-1">
          Upload your PDF resume to get AI-powered skill analysis and personalized recommendations.
        </p>
      </div>

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
                Analyzing with AI…
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
              <p className="font-medium text-emerald-800">{success}</p>
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

      {/* ── AI ANALYSIS RESULTS ── */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">AI Analysis Results</h2>
              <p className="text-sm text-slate-500">Here's what we found in your resume</p>
            </div>
          </div>

          {/* Skills & Keywords Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Extracted Skills */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Extracted Skills</h3>
                <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {(analysisResult.skills || []).length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(analysisResult.skills || []).length > 0 ? (
                  analysisResult.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No skills extracted</p>
                )}
              </div>
            </div>

            {/* Resume Keywords */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Resume Keywords</h3>
                <span className="ml-auto text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {(analysisResult.keywords || []).length}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(analysisResult.keywords || []).length > 0 ? (
                  analysisResult.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/50"
                    >
                      {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No keywords extracted</p>
                )}
              </div>
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Skill Gap Analysis</h3>
              <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {(analysisResult.missingSkills || []).length} gaps
              </span>
            </div>
            {(analysisResult.missingSkills || []).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-emerald-600 font-medium">
                🎉 No skill gaps detected — you're well prepared!
              </p>
            )}
          </div>

          {/* AI Improvement Suggestions */}
          {(analysisResult.improvementSuggestions || []).length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-800">AI Improvement Suggestions</h3>
              </div>
              <div className="space-y-3">
                {analysisResult.improvementSuggestions.map((item, idx) => (
                  <div
                    key={`${item.skill}-${idx}`}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSuggestion(idx)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-100/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{item.skill}</span>
                      </div>
                      {expandedSuggestion === idx ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {expandedSuggestion === idx && (
                      <div className="px-4 pb-4 space-y-3 border-t border-slate-100">
                        {item.importance && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                              Why it matters
                            </p>
                            <p className="text-sm text-slate-700">{item.importance}</p>
                          </div>
                        )}
                        {item.howToImprove && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                              How to improve
                            </p>
                            <p className="text-sm text-slate-700">{item.howToImprove}</p>
                          </div>
                        )}
                        {item.resources && (
                          <a
                            href={item.resources}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View recommended resource
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Roadmap */}
          {(analysisResult.roadmap || []).length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Learning Roadmap</h3>
              </div>
              <div className="space-y-4">
                {analysisResult.roadmap.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {idx < analysisResult.roadmap.length - 1 && (
                        <div className="w-0.5 flex-1 bg-indigo-100 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-slate-800">{step.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{step.description}</p>
                      {step.url && (
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Resource link
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentUpload;
