import React, { useState, useCallback, useRef } from "react";
import api from "../../services/api";
import { Upload as UploadIcon, FileText, CheckCircle, XCircle } from "lucide-react";

const StudentUpload = () => {
  const formRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await api.post("/student/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(res.data.message || "Resume uploaded successfully!");
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

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Resume</h1>
        <p className="text-slate-500 mt-1">
          Upload your PDF resume to get personalized skill analysis and recommendations.
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
                Uploading…
              </>
            ) : (
              <>
                <UploadIcon className="w-5 h-5" />
                Upload Resume
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
    </div>
  );
};

export default StudentUpload;
