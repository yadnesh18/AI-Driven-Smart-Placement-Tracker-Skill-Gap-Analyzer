import React, { useEffect, useState } from "react";
import api from "../../services/api";

const vignetteShadow = '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)';

const typeConfig = {
  interview_invite: { icon: "calendar_today", bgIcon: "#d8e2ff", colorIcon: "#0058be", label: "Interview Invite", bg: "#d8e2ff", color: "#0058be" },
  selected: { icon: "check_circle", bgIcon: "#e2dfff", colorIcon: "#3525cd", label: "Selected", bg: "#e2dfff", color: "#3525cd" },
  rejected: { icon: "cancel", bgIcon: "#ffdad6", colorIcon: "#ba1a1a", label: "Not Selected", bg: "#ffdad6", color: "#ba1a1a" },
};

const StudentNotifications = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingRead, setMarkingRead] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try { const res = await api.get("/student/notifications"); setData(res.data); }
      catch (err) { setError(err.response?.data?.message || err.message || "Failed to load notifications"); }
      finally { setLoading(false); }
    };
    fetchNotifications();
  }, []);

  const handleMarkRead = async (notifId) => {
    setMarkingRead(notifId);
    try {
      await api.put(`/student/notifications/${notifId}/read`);
      setData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((n) => n.id === notifId ? { ...n, read: true } : n),
        unreadCount: Math.max(0, (prev.unreadCount || 1) - 1),
      }));
    } catch { alert("Failed to mark as read"); }
    finally { setMarkingRead(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
      <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid #e2dfff', borderTopColor: '#3525cd', borderRadius: '9999px' }} />
    </div>
  );

  if (error) return (
    <div className="flex items-start gap-3" style={{ borderRadius: '0.75rem', padding: '1.25rem', backgroundColor: '#ffdad6' }}>
      <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>error</span>
      <div>
        <h2 style={{ fontWeight: 600, color: '#93000a' }}>Unable to load notifications</h2>
        <p style={{ fontSize: '0.875rem', color: '#ba1a1a' }}>{error}</p>
      </div>
    </div>
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>Notifications</h1>
          <p style={{ color: '#464555', marginTop: '0.375rem' }}>Interview invites, selections, and updates from admins.</p>
        </div>
        {unreadCount > 0 && (
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#3525cd', backgroundColor: '#e2dfff', padding: '0.375rem 0.875rem', borderRadius: '9999px' }}>
            {unreadCount} unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ borderRadius: '0.75rem', backgroundColor: '#ffffff', boxShadow: vignetteShadow, padding: '3rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#c7c4d8', display: 'block', marginBottom: '0.75rem' }}>notifications</span>
          <p style={{ fontWeight: 600, color: '#464555' }}>No notifications yet</p>
          <p style={{ fontSize: '0.875rem', color: '#777587', marginTop: '0.25rem' }}>You'll see interview invites and selection updates here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.interview_invite;
            return (
              <div
                key={notif.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  boxShadow: notif.read ? 'none' : vignetteShadow,
                  border: notif.read ? '1px solid #edeeef' : '1px solid rgba(53,37,205,0.08)',
                  overflow: 'hidden',
                  opacity: notif.read ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <div className="flex items-start gap-4" style={{ padding: '1.25rem' }}>
                  <div className="flex items-center justify-center flex-shrink-0"
                    style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: config.bgIcon }}>
                    <span className="material-symbols-outlined" style={{ color: config.colorIcon, fontVariationSettings: "'FILL' 1" }}>{config.icon}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.625rem', borderRadius: '0.375rem', backgroundColor: config.bg, color: config.color }}>
                        {config.label}
                      </span>
                      {!notif.read && (
                        <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#3525cd' }} />
                      )}
                    </div>

                    <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: '#777587' }}>business</span>
                      <span style={{ fontWeight: 600, color: '#191c1d', fontSize: '0.9375rem' }}>{notif.company}</span>
                      <span style={{ fontSize: '0.8125rem', color: '#464555' }}>— {notif.role}</span>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: '#464555', marginTop: '0.5rem', lineHeight: 1.6 }}>{notif.message}</p>

                    {notif.interviewDate && (
                      <div className="flex items-center gap-2" style={{ marginTop: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: '#0058be' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>event</span>
                        Interview: {new Date(notif.interviewDate).toLocaleString()}
                      </div>
                    )}

                    <div className="flex items-center justify-between" style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#777587' }}>
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      {!notif.read && (
                        <button onClick={() => handleMarkRead(notif.id)} disabled={markingRead === notif.id}
                          style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3525cd', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', opacity: markingRead === notif.id ? 0.5 : 1, transition: 'all 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2dfff'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
