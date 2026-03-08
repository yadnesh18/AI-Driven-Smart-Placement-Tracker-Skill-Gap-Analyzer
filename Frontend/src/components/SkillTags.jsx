import React from "react";

const SkillTags = ({ title, skills = [], emptyMessage = "No skills available yet" }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100/80 p-6">
      {title && <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>}
      {skills.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillTags;
