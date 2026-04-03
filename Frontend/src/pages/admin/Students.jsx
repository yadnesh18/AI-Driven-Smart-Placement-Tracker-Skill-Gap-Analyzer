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
  Mail,
  XCircle,
  Calendar,
  Building2,
  Filter,
} from "lucide-react";

const STATUS_COLOURS = {
  pending: "bg-slate-100 text-slate-600",
  invited: "bg-blue-100 text-blue-700",
  selected: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // Company filter
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companyStudents, setCompanyStudents] = useState(null);
  const [loadingCompanyStudents, setLoadingCompanyStudents] = useState(false);

  // Action states
  const [actionLoading, setActionLoading] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studRes, compRes] = await Promise.allSettled([
          api.get("/admin/students"),
          api.get("/admin/companies"),
        ]);
        if (studRes.status === "fulfilled") setStudents(studRes.value.data);
        if (compRes.status === "fulfilled") {
          setCompanies(compRes.value.data.companies || compRes.value.data || []);
        }
        if (studRes.status === "rejected") {
          setError(studRes.reason?.response?.data?.message || "Failed to load students");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCompanyFilter = async (companyId) => {
    setSelectedCompanyId(companyId);
    if (!companyId) {
      setCompanyStudents(null);
      return;
    }
    setLoadingCompanyStudents(true);
    try {
      const res = await api.get(`/admin/students/by-company?companyId=${companyId}`);
      setCompanyStudents(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load students for this company");
      setCompanyStudents(null);
    } finally {
      setLoadingCompanyStudents(false);
    }
  };

  const handleAction = async (action, studentId, companyId, message) => {
    setActionLoading(`${action}-${studentId}`);
    setActionSuccess(null);
    try {
      await api.post(`/admin/students/${studentId}/${action}`, {
        companyId,
        message,
      });
      setActionSuccess(`Student ${action === "invite" ? "invited" : action === "select" ? "selected" : "notified"} successfully!`);

      // Refresh company students
      if (selectedCompanyId) {
        handleCompanyFilter(selectedCompanyId);
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} student`);
    } finally {
      setActionLoading(null);
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

  // Display students based on company filter or general list
  const displayList = companyStudents ? companyStudents.students : students;

  const filtered = displayList.filter((s) => {
    const q = search.toLowerCase();
    const name = s.name || "";
    const email = s.email || "";
    return !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <p className="text-sm text-slate-500 mt-1">
          View student eligibility per company. Invite, select, or reject students.
        </p>
      </div>

      {/* Company Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCompanyId}
            onChange={(e) => handleCompanyFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="">All Students</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.role}
                {c.totalApplicants !== undefined ? ` (${c.totalApplicants} analyzed)` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>{filtered.length} students</span>
        </div>
      </div>

      {/* Summary for company filter */}
      {companyStudents && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{companyStudents.summary?.total || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Total Analyzed</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{companyStudents.summary?.eligible || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Eligible</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{companyStudents.summary?.notEligible || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Not Eligible</p>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-800">{actionSuccess}</p>
        </div>
      )}

      {loadingCompanyStudents ? (
        <PageSkeleton />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No students found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => {
            const studentId = student.studentId || student._id;
            const isExpanded = expandedId === studentId;
            const skills = student.matchedSkills || student.skills || [];
            const missingSkills = student.missingSkills || [];
            const score = student.score;
            const eligible = student.eligible;
            const status = student.status || "pending";

            return (
              <div
                key={studentId}
                className="bg-white rounded-2xl shadow-md border border-slate-100/80 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : studentId)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {(student.name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{student.name}</p>
                      <p className="text-xs text-slate-500 truncate">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {score !== undefined && (
                      <span className={`text-sm font-bold ${eligible ? "text-emerald-600" : "text-amber-600"}`}>
                        {score}%
                      </span>
                    )}
                    {eligible !== undefined && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        eligible ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {eligible ? "Eligible" : "Not Eligible"}
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOURS[status] || STATUS_COLOURS.pending}`}>
                      {status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                    {/* Matched Skills */}
                    {skills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Matched Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {missingSkills.map((s) => (
                            <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin Actions — Invite / Select / Reject (Issue 6) */}
                    {selectedCompanyId && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => handleAction("invite", studentId, selectedCompanyId)}
                          disabled={actionLoading === `invite-${studentId}` || status === "invited" || status === "selected"}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {actionLoading === `invite-${studentId}` ? "…" : "Invite for Interview"}
                        </button>
                        <button
                          onClick={() => handleAction("select", studentId, selectedCompanyId)}
                          disabled={actionLoading === `select-${studentId}` || status === "selected"}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {actionLoading === `select-${studentId}` ? "…" : "Select"}
                        </button>
                        <button
                          onClick={() => handleAction("reject", studentId, selectedCompanyId)}
                          disabled={actionLoading === `reject-${studentId}` || status === "rejected"}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          {actionLoading === `reject-${studentId}` ? "…" : "Reject"}
                        </button>
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
