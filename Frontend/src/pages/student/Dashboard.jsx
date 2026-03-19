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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get("/student/dashboard");
        setDashboard(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
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
  let name = raw.name;
  let resumeUploaded = raw.resumeUploaded;
  let resumeScore = typeof raw.resumeScore === "number" ? raw.resumeScore : 0;
  let skills = Array.isArray(raw.skills) ? raw.skills : [];
  let keywords = Array.isArray(raw.keywords) ? raw.keywords : [];
  let missingSkills = Array.isArray(raw.missingSkills) ? raw.missingSkills : [];
  let roadmap = Array.isArray(raw.roadmap) ? raw.roadmap : [];
  let appliedCompanies = Array.isArray(raw.appliedCompanies) ? raw.appliedCompanies : [];
  let progress = raw.progress && typeof raw.progress === "object" ? raw.progress : { applied: 0, shortlisted: 0, interview: 0, selected: 0 };
  let improvementSuggestions = Array.isArray(raw.improvementSuggestions) ? raw.improvementSuggestions : [];

  const useMock = import.meta.env.DEV && !name && skills.length === 0 && appliedCompanies.length === 0;
  if (useMock) {
    name = name || "Student";
    skills = ["JavaScript", "React", "Node.js"];
    missingSkills = ["System Design", "Communication"];
    keywords = ["JavaScript developer", "frontend", "REST APIs"];
    roadmap = [
      { title: "Resume Basics", description: "Create a professional resume to get started.", url: null },
      { title: "Skills Assessment", description: "Identify skill gaps from your profile.", url: null },
    ];
    appliedCompanies = [
      { name: "TechCorp", role: "SDE", status: "applied" },
      { name: "StartupXYZ", role: "SDE", status: "shortlisted" },
    ];
    progress = { applied: 2, shortlisted: 1, interview: 0, selected: 0 };
  }

  const totalApps = (progress.applied || 0) + (progress.shortlisted || 0) + (progress.interview || 0) + (progress.selected || 0);
  const readinessPercent = Math.min(95, resumeUploaded ? 40 + resumeScore * 0.5 : resumeScore * 0.4);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, <span className="text-indigo-600">{name || "Student"}</span> 👋
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

          <DashboardCard title="Recommended Companies" subtitle="Based on your profile">
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
          <DashboardCard title="Skill Gap Analysis" subtitle="Skills to improve">
            {missingSkills.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">No skill gaps detected. Keep learning!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </DashboardCard>

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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-800">
                        {item.skill || "Skill"}
                      </h3>
                    </div>
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
                        href={item.resources}
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

          <DashboardCard title="Placement Roadmap" subtitle="Recommended steps">
            {roadmap.length === 0 ? (
              <p className="text-slate-500 text-sm py-4">Upload your resume for personalised suggestions.</p>
            ) : (
              <ul className="space-y-3">
                {roadmap.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>
      </div>

      {/* Skills & keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkillTags title="Extracted Skills" skills={skills} emptyMessage="No skills extracted yet." />
        <SkillTags title="Resume Keywords" skills={keywords} emptyMessage="No keywords extracted yet." />
        <SkillTags title="Skill Gaps" skills={missingSkills} emptyMessage="No skill gaps detected." />
      </div>
    </div>
  );
};

export default StudentDashboard;
