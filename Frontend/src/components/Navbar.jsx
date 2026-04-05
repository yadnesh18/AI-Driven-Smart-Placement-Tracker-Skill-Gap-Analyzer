import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import api from "../services/api";

const Navbar = ({ onMenuClick, role, onLogout }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "student") {
      api.get("/student/notifications")
        .then((res) => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [role]);

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between"
      style={{
        height: "4rem",
        padding: "0 2rem",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 25px -5px rgba(53, 37, 205, 0.04)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-4" style={{ flex: 1 }}>
        <button
          className="lg:hidden"
          onClick={onMenuClick}
          style={{
            padding: "0.5rem",
            borderRadius: "0.5rem",
            color: "#64748b",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative w-full hidden md:block" style={{ maxWidth: "24rem" }}>
          <span
            className="material-symbols-outlined absolute"
            style={{
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#777587",
              fontSize: "1.25rem",
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search skills, companies..."
            style={{
              width: "100%",
              paddingLeft: "2.5rem",
              paddingRight: "1rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              backgroundColor: "#edeeef",
              border: "none",
              borderRadius: "9999px",
              fontSize: "0.875rem",
              color: "#191c1d",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Notification bell for students */}
        {role === "student" && (
          <button
            onClick={() => navigate("/student/notifications")}
            className="relative"
            style={{
              padding: "0.5rem",
              borderRadius: "9999px",
              color: "#64748b",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(237, 238, 239, 0.5)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span
                className="absolute flex items-center justify-center"
                style={{
                  top: "0.25rem",
                  right: "0.25rem",
                  width: "0.5rem",
                  height: "0.5rem",
                  backgroundColor: "#ba1a1a",
                  borderRadius: "9999px",
                  border: "2px solid #ffffff",
                }}
              />
            )}
          </button>
        )}

        {/* Divider */}
        <div style={{ height: "2rem", width: "1px", backgroundColor: "rgba(199, 196, 216, 0.3)" }} />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#191c1d", lineHeight: 1.2, margin: 0 }}>
              {role === "admin" ? "Admin" : "Student"}
            </p>
            <p style={{ fontSize: "0.625rem", color: "#777587", fontWeight: 500, margin: 0, textTransform: "capitalize" }}>
              {role} Panel
            </p>
          </div>
          <div
            className="flex items-center justify-center"
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "9999px",
              backgroundColor: "#e2dfff",
              color: "#3525cd",
              fontWeight: 700,
              fontSize: "0.875rem",
              border: "2px solid #ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>person</span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            fontSize: "0.8125rem",
            fontWeight: 500,
            color: "#ba1a1a",
            backgroundColor: "#ffdad6",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffb4ab")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffdad6")}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>logout</span>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
