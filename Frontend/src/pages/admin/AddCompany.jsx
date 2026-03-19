import React, { useState } from "react";
import api from "../../services/api";
import { PlusCircle, AlertCircle, CheckCircle } from "lucide-react";

const AdminAddCompany = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [pkg, setPkg] = useState("");
  const [skills, setSkills] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedPackage = Number(pkg);
    if (!name || !role || Number.isNaN(parsedPackage)) {
      setError("Name, role and numeric package are required.");
      return;
    }

    const requiredSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      await api.post("/admin/company", {
        name,
        role,
        package: parsedPackage,
        requiredSkills,
        description,
        location,
        deadline: deadline || undefined,
      });
      setSuccess("Company added successfully.");
      setName("");
      setRole("");
      setPkg("");
      setSkills("");
      setDescription("");
      setLocation("");
      setDeadline("");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to add company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Add Company</h1>
        <p className="text-slate-500 mt-1">
          Create a new company opening for students to apply.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-6 space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Google"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Software Engineer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Package (LPA)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              value={pkg}
              onChange={(e) => setPkg(e.target.value)}
              placeholder="24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bangalore, India"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Application Deadline</label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Required Skills (comma separated)
          </label>
          <input
            type="text"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="DSA, JavaScript, React"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of the role and expectations."
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-800">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
        >
          <PlusCircle className="w-5 h-5" />
          {loading ? "Saving..." : "Add Company"}
        </button>
      </form>
    </div>
  );
};

export default AdminAddCompany;
