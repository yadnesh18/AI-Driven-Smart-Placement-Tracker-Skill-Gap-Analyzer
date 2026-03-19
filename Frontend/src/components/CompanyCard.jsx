import React from "react";
import { Building2, Briefcase, IndianRupee, MapPin, Calendar } from "lucide-react";
import SkillTag from "./SkillTag";

const CompanyCard = ({
  company,
  onApply,
  onViewDetails,
  applied = false,
  applying = false,
}) => {
  const pkg = typeof company.package === "number" ? `${company.package} LPA` : company.package || "Not disclosed";
  const skills = company.requiredSkills || [];
  const matchPercent = typeof company.matchPercent === "number" ? company.matchPercent : null;

  const matchColor =
    matchPercent >= 75
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : matchPercent >= 40
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-red-500 bg-red-50 border-red-200";

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100/80 hover:border-indigo-100 group">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Building2 className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {company.name}
              </h3>
              {matchPercent !== null && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${matchColor}`}>
                  {matchPercent}% match
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-indigo-600">
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{company.role}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-slate-600">
                <IndianRupee className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">{pkg}</span>
              </div>
              {company.location && (
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="text-xs">{company.location}</span>
                </div>
              )}
            </div>
            {company.deadline && (
              <div className="flex items-center gap-1 mt-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs">Deadline: {new Date(company.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onApply?.(company._id)}
            disabled={applied || applying}
            className={`flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
              applied || applying
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
            }`}
          >
            {applied ? "Applied" : applying ? "Applying…" : "Apply"}
          </button>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails?.(company)}
              className="py-2.5 px-4 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;
