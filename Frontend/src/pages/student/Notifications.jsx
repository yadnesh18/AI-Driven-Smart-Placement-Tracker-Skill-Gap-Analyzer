import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { PageSkeleton } from "../../components/LoadingSkeleton";
import EmptyState from "../../components/EmptyState";
import {
  Bell,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  Mail,
} from "lucide-react";

const typeConfig = {
  interview_invite: {
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
    label: "Interview Invite",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  selected: {
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-600",
    label: "Selected",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  rejected: {
    icon: XCircle,
    color: "bg-red-100 text-red-600",
    label: "Not Selected",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

const StudentNotifications = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingRead, setMarkingRead] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/student/notifications");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkRead = async (notifId) => {
    setMarkingRead(notifId);
    try {
      await api.put(`/student/notifications/${notifId}/read`);
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) =>
          n.id === notifId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, (prev.unreadCount || 1) - 1),
      }));
    } catch (err) {
      alert("Failed to mark as read");
    } finally {
      setMarkingRead(null);
    }
  };

  if (loading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h2 className="font-semibold text-red-700">Unable to load notifications</h2>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 mt-1">Interview invites, selections, and updates from admins.</p>
        </div>
        {unreadCount > 0 && (
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see interview invites and selection updates here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.interview_invite;
            const IconComp = config.icon;

            return (
              <div
                key={notif.id}
                className={`bg-white rounded-2xl shadow-md border overflow-hidden transition-all ${
                  notif.read ? "border-slate-100/80 opacity-75" : "border-indigo-100 shadow-indigo-100/50"
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${config.badge}`}>
                        {config.label}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-800">{notif.company}</span>
                      <span className="text-sm text-slate-500">— {notif.role}</span>
                    </div>

                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{notif.message}</p>

                    {notif.interviewDate && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-blue-600 font-medium">
                        <Calendar className="w-4 h-4" />
                        Interview: {new Date(notif.interviewDate).toLocaleString()}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          disabled={markingRead === notif.id}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                        >
                          {markingRead === notif.id ? "…" : "Mark as read"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;
