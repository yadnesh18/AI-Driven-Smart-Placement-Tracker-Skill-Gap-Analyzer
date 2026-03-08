import React from "react";

const SkillTag = ({ skill, variant = "default" }) => {
  const variants = {
    default: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    gap: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    success: "bg-emerald-50 text-emerald-700",
  };
  const cls = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${cls}`}
    >
      {skill}
    </span>
  );
};

export default SkillTag;
