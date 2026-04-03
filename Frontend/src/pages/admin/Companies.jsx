import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { TableSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import { Briefcase, Trash2, Pencil, AlertCircle, X, CheckCircle, MapPin, Users } from "lucide-react";

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get("/admin/companies");
        // Backend returns { companies: [...] } with applicant counts
        setCompanies(res.data.companies || res.data || []);
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

  const startEditing = (company) => {
    setEditingCompany(company._id);
    setEditForm({
      name: company.name || "",
      role: company.role || "",
      package: company.package || "",
      requiredSkills: (company.requiredSkills || []).join(", "),
      description: company.description || "",
      location: company.location || "",
      deadline: company.deadline ? new Date(company.deadline).toISOString().split("T")[0] : "",
      isActive: company.isActive !== false,
    });
  };

  const cancelEditing = () => {
    setEditingCompany(null);
    setEditForm({});
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      const payload = {
        name: editForm.name,
        role: editForm.role,
        package: Number(editForm.package),
        requiredSkills: editForm.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        description: editForm.description,
        location: editForm.location,
        deadline: editForm.deadline || undefined,
        isActive: editForm.isActive,
      };
      const res = await api.put(`/companies/${id}`, payload);
      setCompanies((prev) => prev.map((c) => (c._id === id ? { ...c, ...res.data } : c)));
      setEditingCompany(null);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to update company");
    } finally {
      setSaving(false);
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
          View, edit, and manage all companies. Applicant stats shown per company.
        </p>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No companies yet"
          description="Add companies from the Add Company page to get started."
        />
      ) : (
        <div className="space-y-4">
          {companies.map((company) => {
            const isEditing = editingCompany === company._id;

            return (
              <div
                key={company._id}
                className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-5 transition-all"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Company Name</label>
                        <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                        <input type="text" value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Package (LPA)</label>
                        <input type="number" value={editForm.package} onChange={(e) => setEditForm({ ...editForm, package: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
                        <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Deadline</label>
                        <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input type="checkbox" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="w-4 h-4 accent-indigo-600" />
                        <label className="text-sm text-slate-700">Active</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Required Skills (comma separated)</label>
                      <input type="text" value={editForm.requiredSkills} onChange={(e) => setEditForm({ ...editForm, requiredSkills: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                      <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleSaveEdit(company._id)} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button onClick={cancelEditing} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors">
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800">{company.name}</h3>
                        {!company.isActive && company.isActive !== undefined && (
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-0.5">{company.role} · {typeof company.package === "number" ? `${company.package} LPA` : "-"}</p>
                      {company.location && (
                        <div className="flex items-center gap-1 text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="text-xs">{company.location}</span>
                        </div>
                      )}

                      {/* Applicant Stats (Issue 6) */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{company.totalApplicants || 0}</span>
                          <span className="text-slate-400">analyzed</span>
                        </div>
                        {company.eligibleCount > 0 && (
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            {company.eligibleCount} eligible
                          </span>
                        )}
                      </div>

                      {(company.requiredSkills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {company.requiredSkills.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => startEditing(company)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium text-sm transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(company._id)}
                        disabled={deletingId === company._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === company._id ? "..." : "Delete"}
                      </button>
                    </div>
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

export default AdminCompanies;
