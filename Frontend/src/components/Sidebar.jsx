import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Building2,
  FileCheck,
  Map,
  PlusCircle,
  Users,
  BarChart3,
  X,
  GraduationCap,
  Briefcase,
  Bell,
} from "lucide-react";

const studentLinks = [
  { name: "Dashboard", to: "/student/dashboard", icon: LayoutDashboard },
  { name: "Upload Resume", to: "/student/upload", icon: Upload },
  { name: "Companies", to: "/student/companies", icon: Building2 },
  { name: "Applications", to: "/student/result", icon: FileCheck },
  { name: "Skill Roadmap", to: "/student/roadmap", icon: Map },
  { name: "Notifications", to: "/student/notifications", icon: Bell },
];

const adminLinks = [
  { name: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Add Company", to: "/admin/add-company", icon: PlusCircle },
  { name: "Manage Companies", to: "/admin/companies", icon: Briefcase },
  { name: "Students", to: "/admin/students", icon: Users },
  { name: "Analytics", to: "/admin/analytics", icon: BarChart3 },
];

const Sidebar = ({ links = [], role, open, onClose }) => {
  const navLinks = role === "admin" ? adminLinks : studentLinks;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-slate-900/20 z-20 lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <Link
              to={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-slate-800">SmartPlacement</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
              {role === "admin" ? "Admin Panel" : "Student Panel"}
            </p>
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
