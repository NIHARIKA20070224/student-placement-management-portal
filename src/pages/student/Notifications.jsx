
import { useCallback, useEffect, useState } from "react";

import {
  Bell,
  CheckCircle,
  Clock,
  Calendar,
  FileText,
  ArrowLeft,
  XCircle,
  CheckCheck,
  RefreshCw,
} from "lucide-react";

import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

function formatDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please log in again to view your notifications.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch (err) {
      console.error("Fetch notifications error:", err);
      setError(
        err.message ||
          "Unable to load notifications. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    const token = getToken();

    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    setUpdatingId(notificationId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Could not mark notification as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: 1 }
            : notification
        )
      );
    } catch (err) {
      console.error("Mark notification read error:", err);
      setError(err.message || "Could not update notification.");
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();

    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    setMarkingAll(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Could not mark all notifications as read."
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );
    } catch (err) {
      console.error("Mark all notifications read error:", err);
      setError(err.message || "Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) =>
      !(
        notification.is_read === 1 ||
        notification.is_read === true ||
        notification.is_read === "1"
      )
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        fontFamily: "Arial, sans-serif",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "25px 15px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            padding: "0 12px",
            marginBottom: "35px",
          }}
        >
          CareerConnect
        </div>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "7px",
          }}
        >
          <SidebarLink to="/student" icon={<span>▦</span>} text="Dashboard" />

          <SidebarLink
            to="/student/companies"
            icon={<span>▣</span>}
            text="Companies"
          />

          <SidebarLink
            to="/student/drives"
            icon={<span>◷</span>}
            text="Placement Drives"
          />

          <SidebarLink
            to="/student/applications"
            icon={<span>▤</span>}
            text="My Applications"
          />

          <SidebarLink
            to="/student/profile"
            icon={<span>♙</span>}
            text="My Profile"
          />

          <SidebarLink
            to="/student/notifications"
            icon={<Bell size={18} />}
            text="Notifications"
            active
          />

          <SidebarLink
            to="/login"
            icon={<span>↪</span>}
            text="Logout"
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "30px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "30px" }}>
          <Link
            to="/student"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "#64748b",
              textDecoration: "none",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "28px",
            }}
          >
            Notifications
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Stay updated with your placement activities.
          </p>
        </div>

        {/* Notification List */}
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "9px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={19} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#1e293b",
                    fontSize: "19px",
                  }}
                >
                  Recent Notifications
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {unreadCount} unread notification
                  {unreadCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={fetchNotifications}
                disabled={loading}
                style={buttonStyle}
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  style={{
                    ...buttonStyle,
                    background: "#2563eb",
                    color: "white",
                    borderColor: "#2563eb",
                    opacity: markingAll ? 0.6 : 1,
                  }}
                >
                  <CheckCheck size={15} />
                  {markingAll ? "Updating..." : "Mark all as read"}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "16px",
                padding: "12px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                borderRadius: "8px",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div style={emptyStateStyle}>Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div style={emptyStateStyle}>
              <Bell size={30} color="#94a3b8" />
              <h3 style={{ color: "#334155", marginBottom: "6px" }}>
                No notifications yet
              </h3>
              <p style={{ color: "#64748b", margin: 0, fontSize: "13px" }}>
                New placement updates will appear here when they are added
                to your account.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  updating={updatingId === notification.id}
                  onMarkRead={() => markAsRead(notification.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Information Banner */}
        <section
          style={{
            marginTop: "25px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <Calendar size={22} color="#2563eb" />

          <p
            style={{
              margin: 0,
              color: "#334155",
              fontSize: "13px",
            }}
          >
            Keep checking this section for new placement drives and
            application status updates.
          </p>
        </section>
      </main>
    </div>
  );
}

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "7px",
  padding: "9px 12px",
  borderRadius: "7px",
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#334155",
  cursor: "pointer",
  fontSize: "12px",
};

const emptyStateStyle = {
  minHeight: "180px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  textAlign: "center",
  padding: "20px",
};

function SidebarLink({ to, icon, text, active = false }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        borderRadius: "7px",
        color: active ? "white" : "#cbd5e1",
        background: active ? "#2563eb" : "transparent",
        textDecoration: "none",
        fontSize: "14px",
      }}
    >
      {icon}
      {text}
    </Link>
  );
}

function NotificationCard({ notification, updating, onMarkRead }) {
  const isRead =
    notification.is_read === 1 ||
    notification.is_read === true ||
    notification.is_read === "1";

  let icon = <Bell size={19} />;
  let background = "#eff6ff";
  let color = "#2563eb";

  const type = String(notification.type || "").toLowerCase();

  if (type === "selected" || type === "success") {
    icon = <CheckCircle size={19} />;
    background = "#ecfdf5";
    color = "#059669";
  } else if (type === "rejected") {
    icon = <XCircle size={19} />;
    background = "#fef2f2";
    color = "#dc2626";
  } else if (type === "application") {
    icon = <FileText size={19} />;
    background = "#eff6ff";
    color = "#2563eb";
  } else if (type === "drive" || type === "placement") {
    icon = <Calendar size={19} />;
    background = "#fff7ed";
    color = "#ea580c";
  } else if (type === "general") {
    icon = <Clock size={19} />;
    background = "#f8fafc";
    color = "#475569";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "17px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        background: isRead ? "#ffffff" : "#f8fbff",
        opacity: isRead ? 0.8 : 1,
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "9px",
          background,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            margin: 0,
            color: "#1e293b",
            fontSize: "14px",
            fontWeight: isRead ? "500" : "700",
          }}
        >
          {notification.title}
          {!isRead && (
            <span
              style={{
                display: "inline-block",
                width: "7px",
                height: "7px",
                background: "#2563eb",
                borderRadius: "50%",
                marginLeft: "8px",
                verticalAlign: "middle",
              }}
            />
          )}
        </h3>

        <p
          style={{
            margin: "5px 0 0",
            color: "#64748b",
            fontSize: "13px",
            lineHeight: "1.5",
            overflowWrap: "anywhere",
          }}
        >
          {notification.message}
        </p>

        {!isRead && (
          <button
            onClick={onMarkRead}
            disabled={updating}
            style={{
              marginTop: "10px",
              padding: 0,
              border: "none",
              background: "transparent",
              color: "#2563eb",
              cursor: updating ? "wait" : "pointer",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {updating ? "Updating..." : "Mark as read"}
          </button>
        )}
      </div>

      <span
        style={{
          color: "#94a3b8",
          fontSize: "11px",
          whiteSpace: "nowrap",
          alignSelf: "flex-start",
        }}
      >
        {formatDate(notification.created_at || notification.date)}
      </span>
    </div>
  );
}

export default Notifications;
