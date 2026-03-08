import React from "react";

export const PageSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-slate-200 rounded-lg" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
      ))}
    </div>
    <div className="h-64 bg-slate-200 rounded-2xl" />
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
    <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
    <div className="h-8 w-32 bg-slate-200 rounded mb-2" />
    <div className="h-4 w-full bg-slate-100 rounded" />
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
    <div className="h-12 bg-slate-100" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 border-b border-slate-100 flex gap-4 px-6 items-center">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
      </div>
    ))}
  </div>
);

export default PageSkeleton;
