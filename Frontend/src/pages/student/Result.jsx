import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageSkeleton, TableSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import { FileCheck, AlertCircle } from "lucide-react";

const badgeClasses = (status) => {
  const base = "text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap";
  switch (status) {
    case "selected":
      return `${base} bg-emerald-100 text-emerald-700`;
    case "interview":
      return `${base} bg-orange-100 text-orange-700`;
    case "shortlisted":
      return `${base} bg-indigo-100 text-indigo-700`;
    case "rejected":
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-blue-100 text-blue-700`;
  }
};

const StudentResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get("/student/results");
        setResults(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) return <TableSkeleton rows={6} />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load results</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Application Results</h1>
        <p className="text-slate-500 mt-1">Track the status of your company applications.</p>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No applications yet"
          description="Apply to companies from the Companies page to see your application status here."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">
                    Company
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">
                    Role
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 px-6 py-4">
                    Applied At
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr
                    key={`${row.name}-${row.role}-${idx}`}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{row.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.role}</td>
                    <td className="px-6 py-4">
                      <span className={badgeClasses(row.status || "applied")}>
                        {row.status || "Applied"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentResult;
