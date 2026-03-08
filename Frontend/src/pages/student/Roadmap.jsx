import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import { Map, AlertCircle, ExternalLink } from "lucide-react";

const StudentRoadmap = () => {
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const res = await api.get("/student/roadmap");
        setRoadmap(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load roadmap");
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Learning Roadmap</h1>
        <p className="text-slate-500 mt-1">
          Recommended steps to improve your placement readiness.
        </p>
      </div>

      {roadmap.length === 0 ? (
        <EmptyState
          icon={Map}
          title="No roadmap yet"
          description="Upload your resume to get personalized learning suggestions."
        />
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-100 to-transparent" />

          <div className="space-y-0">
            {roadmap.map((item, idx) => (
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
      )}
    </div>
  );
};

export default StudentRoadmap;
