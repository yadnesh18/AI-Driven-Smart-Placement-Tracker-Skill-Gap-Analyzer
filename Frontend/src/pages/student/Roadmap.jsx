import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import { Map, AlertCircle, ExternalLink, Clock, BookOpen, Target } from "lucide-react";

const StudentRoadmap = () => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [legacyRoadmap, setLegacyRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [skillRadar, setSkillRadar] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both legacy roadmap and skill radar data
        const [roadmapRes, radarRes] = await Promise.allSettled([
          api.get("/student/roadmap"),
          api.get("/student/analysis/skill-radar"),
        ]);
        if (roadmapRes.status === "fulfilled") {
          setLegacyRoadmap(roadmapRes.value.data || []);
        }
        if (radarRes.status === "fulfilled") {
          setSkillRadar(radarRes.value.data);
        }
      } catch (err) {
        setError(err.message || "Failed to load roadmap");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!skillRadar || !skillRadar.missingSkills?.length) {
      alert("No missing skills found. Run an analysis against a company first.");
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      const res = await api.post("/student/analysis/roadmap", {
        missingSkills: skillRadar.missingSkills,
        targetCompany: skillRadar.latestCompany || "",
        targetRole: skillRadar.latestRole || "",
        currentScore: skillRadar.overallScore || 0,
        timelineWeeks: 8,
      });
      setRoadmapData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load roadmap</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const weeks = roadmapData?.roadmap || [];
  const hasPersonalisedRoadmap = weeks.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Learning Roadmap</h1>
          <p className="text-slate-500 mt-1">
            {roadmapData?.summary || "Get a personalised week-by-week plan to close your skill gaps."}
          </p>
        </div>
        <button
          onClick={handleGenerateRoadmap}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Target className="w-4 h-4" />
              Generate Roadmap
            </>
          )}
        </button>
      </div>

      {/* Roadmap Summary Stats */}
      {roadmapData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5 text-center">
            <p className="text-3xl font-bold text-indigo-600">{roadmapData.totalWeeks}</p>
            <p className="text-sm text-slate-500 mt-1">Weeks</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{roadmapData.totalHours}</p>
            <p className="text-sm text-slate-500 mt-1">Total Hours</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5 text-center">
            <p className="text-3xl font-bold text-violet-600">
              {roadmapData.generatedFor?.missingSkills?.length || 0}
            </p>
            <p className="text-sm text-slate-500 mt-1">Skills to Close</p>
          </div>
        </div>
      )}

      {/* Personalised Week-by-Week Roadmap (Issue 4) */}
      {hasPersonalisedRoadmap ? (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-100 to-transparent" />

          <div className="space-y-0">
            {weeks.map((week, idx) => (
              <div key={`week-${week.week || idx}`} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg text-white font-bold text-sm">
                  W{week.week || idx + 1}
                </div>

                <div className="flex-1 bg-white rounded-2xl shadow-md border border-slate-100/80 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">{week.title}</h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
                        {week.skill}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{week.estimatedHours}h</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mt-3 leading-relaxed">{week.description}</p>

                  {/* Topics */}
                  {(week.topics || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {week.topics.map((topic) => (
                        <span key={topic} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Resources (Issue 4 — structured objects with clickable links) */}
                  {(week.resources || []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Resources</p>
                      <div className="space-y-1.5">
                        {week.resources.map((resource, rIdx) => (
                          <a
                            key={rIdx}
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2 hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                              <span className="text-sm text-slate-700 group-hover:text-indigo-700">
                                {resource.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                resource.type === "free"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}>
                                {resource.type}
                              </span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practice Links */}
                  {(week.practiceLinks || []).length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Practice</p>
                      <div className="flex flex-wrap gap-2">
                        {week.practiceLinks.map((link, pIdx) => (
                          <a
                            key={pIdx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {link.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : legacyRoadmap.length > 0 ? (
        /* Legacy roadmap fallback */
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-100 to-transparent" />
          <div className="space-y-0">
            {legacyRoadmap.map((item, idx) => (
              <div key={`${item.title}-${idx}`} className="relative flex gap-6 pb-8 last:pb-0">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg text-white font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1 bg-white rounded-2xl shadow-md border border-slate-100/80 p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.description}</p>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Learn more
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Map}
          title="No roadmap yet"
          description="Upload your resume and run an analysis against a company, then click 'Generate Roadmap' for a personalised learning plan."
        />
      )}
    </div>
  );
};

export default StudentRoadmap;
