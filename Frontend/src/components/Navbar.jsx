import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User, Bell } from "lucide-react";
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
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <button
        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* Notification bell for students */}
        {role === "student" && (
          <button
            onClick={() => navigate("/student/notifications")}
            className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">{role}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
