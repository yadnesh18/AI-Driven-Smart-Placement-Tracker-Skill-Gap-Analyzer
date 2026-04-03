import React, { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardCard from "../../components/DashboardCard";
import SkillTags from "../../components/SkillTags";
import ProgressTracker from "../../components/ProgressTracker";
import StatCard from "../../components/StatCard";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import {
  Send,
  Video,
  Award,
  Target,
  AlertCircle,
  ExternalLink,
  Bell,
} from "lucide-react";

const badgeClasses = (status) => {
  const base = "text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap";
  switch (status) {
    case "selected":
      return `${base} bg-emerald-100 text-emerald-700`;
    case "interview":
      return `${base} bg-blue-100 text-blue-700`;
    case "shortlisted":
      return `${base} bg-indigo-100 text-indigo-700`;
    case "rejected":
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-slate-100 text-slate-600`;
  }
};

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [skillRadar, setSkillRadar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashRes, radarRes] = await Promise.allSettled([
          api.get("/student/dashboard"),
          api.get("/student/analysis/skill-radar"),
        ]);
        if (dashRes.status === "fulfilled") setDashboard(dashRes.value.data);
        if (radarRes.status === "fulfilled") setSkillRadar(radarRes.value.data);
        if (dashRes.status === "rejected") {
          setError(dashRes.reason?.response?.data?.message || "Failed to load dashboard");
        }
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load dashboard</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const raw = dashboard || {};
  const name = raw.name || "Student";
  const resumeUploaded = raw.resumeUploaded;
  const resumeScore = typeof raw.resumeScore === "number" ? raw.resumeScore : 0;
  const skills = Array.isArray(raw.skills) ? raw.skills : [];
  const appliedCompanies = Array.isArray(raw.appliedCompanies) ? raw.appliedCompanies : [];
  const progress = raw.progress && typeof raw.progress === "object"
    ? raw.progress
    : { applied: 0, shortlisted: 0, interview: 0, selected: 0 };
  const improvementSuggestions = Array.isArray(raw.improvementSuggestions) ? raw.improvementSuggestions : [];

  // Skill radar data from analysis
  const missingSkills = skillRadar?.missingSkills || raw.missingSkills || [];
  const missingSkillsWithResources = skillRadar?.missingSkillsWithResources || [];
  const latestCompany = skillRadar?.latestCompany;
  const latestRole = skillRadar?.latestRole;
  const overallScore = skillRadar?.overallScore;
  const eligible = skillRadar?.eligible;

  const totalApps = (progress.applied || 0) + (progress.shortlisted || 0) + (progress.interview || 0) + (progress.selected || 0);
  const readinessPercent = Math.min(95, resumeUploaded ? 40 + resumeScore * 0.5 : resumeScore * 0.4);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, <span className="text-indigo-600">{name}</span> 👋
        </h1>
        <p className="text-slate-500 mt-1">Your placement journey at a glance</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Applications Sent" value={progress.applied || 0} icon={Send} color="indigo" />
        <StatCard title="Interviews" value={progress.interview || 0} icon={Video} color="blue" />
        <StatCard title="Selected" value={progress.selected || 0} icon={Award} color="emerald" />
        <StatCard title="Resume Score" value={`${resumeScore}/100`} icon={Target} color="violet" />
      </div>

      {/* Latest analysis result banner */}
      {latestCompany && (
        <div className={`rounded-2xl border p-5 ${eligible ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Latest Analysis</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {latestCompany} — {latestRole}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-800">{overallScore}%</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {eligible ? '✓ Eligible' : '✗ Not Eligible'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <DashboardCard title="Placement Readiness" subtitle="Based on resume, skills, and applications">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Overall readiness</span>
            <span className="font-semibold text-indigo-600">{Math.round(readinessPercent)}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
            <span className={resumeUploaded ? "text-emerald-600" : ""}>
              {resumeUploaded ? "✓" : "○"} Resume uploaded
            </span>
            <span className={skills.length >= 3 ? "text-emerald-600" : ""}>
              {skills.length >= 3 ? "✓" : "○"} Skills added
            </span>
            <span>{totalApps} applications</span>
          </div>
        </div>
      </DashboardCard>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ProgressTracker progress={progress} />

          <DashboardCard title="Recent Applications" subtitle="Your latest company applications">
            {appliedCompanies.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">Apply to companies from the Companies page to see them here.</p>
            ) : (
              <div className="space-y-2">
                {appliedCompanies.slice(0, 5).map((company, idx) => (
                  <div
                    key={`${company.name}-${idx}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 hover:bg-indigo-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{company.name}</p>
                      {company.role && <p className="text-xs text-slate-500">{company.role}</p>}
                    </div>
                    <span className={badgeClasses(company.status)}>{company.status || "applied"}</span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="space-y-6">
          {/* Missing Skills with Preparation Links (Issue 5) */}
          <DashboardCard title="Missing Skills" subtitle={latestCompany ? `For ${latestCompany} — ${latestRole}` : "Skills to improve"}>
            {missingSkillsWithResources.length > 0 ? (
              <div className="space-y-3">
                {missingSkillsWithResources.map((item) => (
                  <div
                    key={item.skill}
                    className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
                  >
                    <span className="font-medium text-slate-800 text-sm">{item.skill}</span>
                    <a
                      href={item.prepLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {item.prepLabel || "Learn"}
                    </a>
                  </div>
                ))}
              </div>
            ) : missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-4">No skill gaps detected. Run an analysis against a company first!</p>
            )}
          </DashboardCard>

          {/* AI Improvement Suggestions */}
          <DashboardCard title="AI Improvement Suggestions" subtitle="Personalised guidance from your resume">
            {improvementSuggestions.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">
                Upload your resume to get detailed suggestions on what to learn next.
              </p>
            ) : (
              <div className="space-y-4">
                {improvementSuggestions.map((item, idx) => (
                  <div
                    key={`${item.skill || "skill"}-${idx}`}
                    className="rounded-xl border border-slate-100 bg-white/70 p-4 shadow-sm"
                  >
                    <h3 className="font-semibold text-slate-800">{item.skill || "Skill"}</h3>
                    {item.importance && (
                      <p className="mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Why it matters:</span>{" "}
                        {item.importance}
                      </p>
                    )}
                    {item.howToImprove && (
                      <p className="mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">How to improve:</span>{" "}
                        {item.howToImprove}
                      </p>
                    )}
                    {item.resources && (
                      <a
                        href={typeof item.resources === "string" ? item.resources : "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View recommended resource →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* Skills only — no keywords dump */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillTags title="Your Skills" skills={skills} emptyMessage="No skills extracted yet. Upload a resume." />
        <SkillTags title="Skill Gaps" skills={missingSkills} emptyMessage="No skill gaps detected." />
      </div>
    </div>
  );
};

export default StudentDashboard;
