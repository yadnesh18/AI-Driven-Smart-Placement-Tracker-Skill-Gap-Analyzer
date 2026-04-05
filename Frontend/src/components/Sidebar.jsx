import React from "react";
import { Link, NavLink } from "react-router-dom";
import { X } from "lucide-react";

const studentLinks = [
  { name: "Dashboard", to: "/student/dashboard", icon: "dashboard" },
  { name: "Resume Analyzer", to: "/student/upload", icon: "psychology" },
  { name: "Companies", to: "/student/companies", icon: "work" },
  { name: "Applications", to: "/student/result", icon: "assignment_turned_in" },
  { name: "Skill Roadmap", to: "/student/roadmap", icon: "auto_awesome" },
  { name: "Notifications", to: "/student/notifications", icon: "notifications" },
];

const adminLinks = [
  { name: "Dashboard", to: "/admin/dashboard", icon: "dashboard" },
  { name: "Add Company", to: "/admin/add-company", icon: "add_business" },
  { name: "Manage Companies", to: "/admin/companies", icon: "business" },
  { name: "Students", to: "/admin/students", icon: "school" },
  { name: "Analytics", to: "/admin/analytics", icon: "analytics" },
];

const Sidebar = ({ role, open, onClose }) => {
  const navLinks = role === "admin" ? adminLinks : studentLinks;

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-20 lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "rgba(25, 28, 29, 0.3)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          gap: "0.5rem",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2rem", padding: "0 0.5rem" }}>
          <div className="flex items-center justify-between">
            <Link
              to={role === "admin" ? "/admin/dashboard" : "/student/dashboard"}
              className="flex items-center gap-3"
              style={{ textDecoration: "none" }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "0.75rem",
                  backgroundColor: "#3525cd",
                  boxShadow: "0 4px 14px -3px rgba(53, 37, 205, 0.3)",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#fff" }}>school</span>
              </div>
              <div>
                <h1
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    color: "#3525cd",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  ScholarFlow
                </h1>
                <p
                  style={{
                    fontSize: "0.625rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "#777587",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {role === "admin" ? "Admin Portal" : "Placement Portal"}
                </p>
              </div>
            </Link>
            <button
              className="lg:hidden"
              onClick={onClose}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                color: "#777587",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className="flex items-center gap-3"
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  backgroundColor: isActive ? "#ffffff" : "transparent",
                  color: isActive ? "#3525cd" : "#64748b",
                  boxShadow: isActive ? "0 1px 3px rgba(53, 37, 205, 0.08)" : "none",
                })}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(79, 70, 229, 0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          <Link
            to={role === "admin" ? "/admin/students" : "/student/upload"}
            className="w-full flex items-center justify-center gap-2"
            style={{
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)",
              color: "#ffffff",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              boxShadow: "0 4px 14px -3px rgba(53, 37, 205, 0.3)",
              transition: "opacity 0.2s",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
              {role === "admin" ? "analytics" : "upload_file"}
            </span>
            <span>{role === "admin" ? "View Reports" : "Analyze Resume"}</span>
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
