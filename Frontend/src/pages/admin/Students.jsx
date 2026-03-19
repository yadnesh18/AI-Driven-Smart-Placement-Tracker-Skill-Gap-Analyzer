import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import {
  Users,
  Search,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";

const STATUS_OPTIONS = ["applied", "shortlisted", "interview", "selected", "rejected"];
const STATUS_COLOURS = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-indigo-100 text-indigo-700",
  interview: "bg-orange-100 text-orange-700",
  selected: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/admin/students");
        setStudents(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load students"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStatusUpdate = async (studentId, companyId, newStatus) => {
    setUpdatingStatus(`${studentId}-${companyId}`);
    try {
      await api.put(`/admin/students/${studentId}/status`, {
        companyId,
        status: newStatus,
      });
      // Update local state
      setStudents((prev) =>
        prev.map((s) => {
          if (s._id !== studentId) return s;
          return {
            ...s,
            appliedCompanies: (s.appliedCompanies || []).map((a) =>
              a.companyId === companyId || (a.companyId && a.companyId.toString() === companyId)
                ? { ...a, status: newStatus }
                : a
            ),
          };
        })
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load students</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (s.name || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.skills || []).some((sk) => sk.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage registered students and track their placement readiness.
        </p>
      </div>

      {/* Search & stats strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>
            {filtered.length} of {students.length} students
          </span>
        </div>
      </div>

      {/* Students list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No students found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search
              ? "Try adjusting your search query."
              : "No students have registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => {
            const skills = student.skills || [];
            const missingSkills = student.missingSkills || [];
            const appliedCompanies = student.appliedCompanies || [];
            const isExpanded = expandedId === student._id;

            return (
              <div
                key={student._id}
                className="bg-white rounded-2xl shadow-md border border-slate-100/80 overflow-hidden transition-all"
              >
                {/* Main row */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : student._id)
                  }
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {(student.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Quick stats */}
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {skills.length} skills
                      </span>
                      {missingSkills.length > 0 && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          {missingSkills.length} gaps
                        </span>
                      )}
                      {student.resumeUrl && (
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Resume ✓
                        </span>
                      )}
                      {appliedCompanies.length > 0 && (
                        <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                          {appliedCompanies.length} apps
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                    {/* Skills */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Skills
                      </p>
                      {skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">
                          No skills extracted yet
                        </p>
                      )}
                    </div>

                    {/* Missing skills */}
                    {missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Missing Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Applications with status update */}
                    {appliedCompanies.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Applications
                        </p>
                        <div className="space-y-2">
                          {appliedCompanies.map((app, idx) => {
                            const appKey = `${student._id}-${app.companyId || idx}`;
                            const isUpdating = updatingStatus === appKey;

                            return (
                              <div
                                key={appKey}
                                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{app.name}</p>
                                  <p className="text-xs text-slate-500">{app.role}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={app.status || "applied"}
                                    onChange={(e) =>
                                      handleStatusUpdate(student._id, app.companyId, e.target.value)
                                    }
                                    disabled={isUpdating}
                                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${
                                      STATUS_COLOURS[app.status] || STATUS_COLOURS.applied
                                    } ${isUpdating ? "opacity-50" : ""}`}
                                  >
                                    {STATUS_OPTIONS.map((s) => (
                                      <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                  {isUpdating && (
                                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Resume link */}
                    {student.resumeUrl && (
                      <a
                        href={student.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View Resume
                        <ExternalLink className="w-3 h-3" />
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
