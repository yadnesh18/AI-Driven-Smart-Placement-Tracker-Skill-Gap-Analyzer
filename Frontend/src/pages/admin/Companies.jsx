import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { TableSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import { Briefcase, Trash2, AlertCircle } from "lucide-react";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/admin/companies");
        setCompanies(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load companies");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/admin/company/${id}`);
      setCompanies((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete company");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <TableSkeleton rows={6} />;

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
        <h1 className="text-2xl font-bold text-slate-800">Manage Companies</h1>
        <p className="text-slate-500 mt-1">
          View and manage all companies available for student applications.
        </p>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No companies yet"
          description="Add companies from the Add Company page to get started."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Company</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Package (LPA)</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-600">Required Skills</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company._id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">{company.name}</td>
                    <td className="px-6 py-4 text-slate-600">{company.role}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {typeof company.package === "number" ? company.package : "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {(company.requiredSkills || []).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(company._id)}
                        disabled={deletingId === company._id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === company._id ? "Deleting..." : "Delete"}
                      </button>
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

export default AdminCompanies;
