import React, { useEffect, useState } from "react";
import api from "../../services/api";
import CompanyCard from "../../components/CompanyCard";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import {
  Building2,
  AlertCircle,
  X,
  CheckCircle,
  XCircle,
  Target,
  ExternalLink,
} from "lucide-react";

const StudentCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/student/companies");
        setCompanies(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load companies");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleApply = async (companyId) => {
    setApplyingId(companyId);
    try {
      await api.post(`/student/apply/${companyId}`);
      setCompanies((prev) =>
        prev.map((c) => (c._id === companyId ? { ...c, applied: true } : c))
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Apply failed";
      alert(msg);
    } finally {
      setApplyingId(null);
    }
  };

  const handleAnalyze = async (company) => {
    setAnalyzingId(company._id);
    setAnalysisResult(null);
    try {
      const res = await api.post("/student/analysis/run", { companyId: company._id });
      setAnalysisResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Analysis failed. Make sure you have uploaded a resume.");
    } finally {
      setAnalyzingId(null);
    }
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load companies</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Companies</h1>
        <p className="text-slate-500 mt-1">
          Browse companies, run skill analysis, and apply.
        </p>
      </div>

      {/* Analysis Result Modal */}
      {analysisResult && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                analysisResult.eligible
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600"
              }`}>
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Analysis: {analysisResult.company} — {analysisResult.role}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold text-slate-800">{analysisResult.score}%</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    analysisResult.eligible
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {analysisResult.eligible ? "✓ Eligible" : "✗ Not Eligible"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAnalysisResult(null)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Score Reason */}
          {analysisResult.scoreReason && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{analysisResult.scoreReason.summary}</p>

              {/* Breakdown */}
              {(analysisResult.scoreReason.breakdown || []).length > 0 && (
                <div className="space-y-3">
                  {analysisResult.scoreReason.breakdown.map((cat, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800 text-sm">{cat.category}</span>
                        <span className="text-xs font-medium text-slate-500">
                          {cat.earnedWeight}/{cat.weight} pts
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${cat.weight > 0 ? (cat.earnedWeight / cat.weight) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(cat.matched || []).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs">
                            ✓ {s}
                          </span>
                        ))}
                        {(cat.missing || []).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-xs">
                            ✗ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Positives & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(analysisResult.scoreReason.positives || []).length > 0 && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Strengths</p>
                    <ul className="space-y-1.5">
                      {analysisResult.scoreReason.positives.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(analysisResult.scoreReason.improvements || []).length > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Areas to Improve</p>
                    <ul className="space-y-1.5">
                      {analysisResult.scoreReason.improvements.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Check back later for new opportunities."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div key={company._id} className="space-y-0">
              <CompanyCard
                company={company}
                onApply={handleApply}
                applied={company.applied}
                applying={applyingId === company._id}
                onViewDetails={handleAnalyze}
              />
              <button
                onClick={() => handleAnalyze(company)}
                disabled={analyzingId === company._id}
                className="w-full mt-[-1px] py-2.5 px-4 rounded-b-2xl font-semibold text-sm transition-all duration-200 border border-t-0 border-slate-200 bg-gradient-to-r from-violet-50 to-indigo-50 text-indigo-600 hover:from-violet-100 hover:to-indigo-100 disabled:opacity-50"
              >
                {analyzingId === company._id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    Analyzing…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" />
                    Run Skill Analysis
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCompanies;
