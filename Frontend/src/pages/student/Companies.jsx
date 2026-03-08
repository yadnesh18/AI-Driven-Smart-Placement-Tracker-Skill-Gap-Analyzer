import React, { useEffect, useState } from "react";
import api from "../../services/api";
import CompanyCard from "../../components/CompanyCard";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import { Building2, AlertCircle } from "lucide-react";

const StudentCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingId, setApplyingId] = useState(null);

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
      await api.post("/student/apply-company", { companyId });
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
          Browse and apply to companies. Click Apply to submit your application.
        </p>
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Check back later for new opportunities. Admins can add companies from the admin panel."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company._id}
              company={company}
              onApply={handleApply}
              applied={company.applied}
              applying={applyingId === company._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCompanies;
