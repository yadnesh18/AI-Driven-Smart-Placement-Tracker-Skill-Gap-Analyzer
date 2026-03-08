import React from "react";
import { Users } from "lucide-react";
import EmptyState from "../../components/EmptyState";

const AdminStudents = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Students</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage registered students and track their progress.
        </p>
      </div>

      <EmptyState
        icon={Users}
        title="Students management"
        description="Connect a backend API to list and manage students. Use GET /api/admin/students to fetch student data."
      />
    </div>
  );
};

export default AdminStudents;
