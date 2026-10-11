
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  LogOut,
  CheckCheck,
  RefreshCw,
  ArrowLeft,
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

function OfficerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please log in again to view notifications.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to load notifications.");
      }

      setNotifications(
        Array.isArray(data.notifications) ? data.notifications : []
      );
    } catch (err) {
      console.error("Officer notifications error:", err);
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    const token = getToken();
    if (!token) return;

    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Could not mark as read.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_read: 1 } : item
        )
      );
    } catch (err) {
      setError(err.message || "Could not update notification.");
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token) return;

    setMarkingAll(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Could not update notifications.");
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: 1 }))
      );
    } catch (err) {
      setError(err.message || "Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (item) =>
      !(
        item.is_read === 1 ||
        item.is_read === true ||
        item.is_read === "1"
      )
  ).length;

  return (
    <div style={pageStyle}>
      <aside style={sidebarStyle}>
        <div style={brandStyle}>CareerConnect</div>

        <nav style={navStyle}>
          <SidebarLink
            to="/officer"
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
          />
          <SidebarLink
            to="/officer/companies"
            icon={<Building2 size={18} />}
            text="Companies"
          />
          <SidebarLink
            to="/officer/drives"
            icon={<Calendar size={18} />}
            text="Placement Drives"
          />
          <SidebarLink
            to="/officer/applicants"
            icon={<Users size={18} />}
            text="Applicants"
          />
          <SidebarLink
            to="/officer/notifications"
            icon={<Bell size={18} />}
            text="Notifications"
            active
          />
          <SidebarLink
            to="/login"
            icon={<LogOut size={18} />}
            text="Logout"
          />
        </nav>
      </aside>

      <main style={mainStyle}>
        <Link to="/officer" style={backLinkStyle}>
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Notifications</h1>
            <p style={subtitleStyle}>
              Stay updated on student applications and placement activities.
            </p>
          </div>

          <Bell size={28} color="#2563eb" />
        </div>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Recent Notifications</h2>
              <p style={subtitleStyle}>
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            <div style={actionsStyle}>
              <button
                onClick={loadNotifications}
                disabled={loading}
                style={secondaryButtonStyle}
              >
                <RefreshCw size={15} />
                Refresh
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={markingAll}
                  style={primaryButtonStyle}
                >
                  <CheckCheck size={15} />
                  {markingAll ? "Updating..." : "Mark all as read"}
                </button>
              )}
            </div>
          </div>

          {error && <div role="alert" style={errorStyle}>{error}</div>}

          {loading ? (
            <EmptyMessage message="Loading notifications..." />
          ) : notifications.length === 0 ? (
            <EmptyMessage message="No notifications yet. New student application updates will appear here." />
          ) : (
            <div style={listStyle}>
              {notifications.map((item) => {
                const isRead =
                  item.is_read === 1 ||
                  item.is_read === true ||
                  item.is_read === "1";

                return (
                  <article
                    key={item.id}
                    style={{
                      ...notificationStyle,
                      background: isRead ? "#fff" : "#f8fbff",
                    }}
                  >
                    <div style={iconBoxStyle}>
                      <Bell size={20} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={notificationTitleStyle}>
                        {item.title}
                        {!isRead && <span style={unreadDotStyle} />}
                      </h3>
                      <p style={messageStyle}>{item.message}</p>
                      <p style={dateStyle}>
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "Recently"}
                      </p>

                      {!isRead && (
                        <button
                          onClick={() => markAsRead(item.id)}
                          disabled={updatingId === item.id}
                          style={textButtonStyle}
                        >
                          {updatingId === item.id
                            ? "Updating..."
                            : "Mark as read"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, text, active = false }) {
  return (
    <Link
      to={to}
      style={{
        ...sidebarLinkStyle,
        color: active ? "#fff" : "#cbd5e1",
        background: active ? "#2563eb" : "transparent",
      }}
    >
      {icon}
      {text}
    </Link>
  );
}

function EmptyMessage({ message }) {
  return <div style={emptyStyle}>{message}</div>;
}

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  background: "#f6f8fb",
  fontFamily: "Arial, sans-serif",
};

const sidebarStyle = {
  width: "240px",
  minHeight: "100vh",
  background: "#0f172a",
  color: "#fff",
  padding: "25px 15px",
  boxSizing: "border-box",
  flexShrink: 0,
};

const brandStyle = {
  fontSize: "22px",
  fontWeight: "bold",
  padding: "0 12px",
  marginBottom: "35px",
};

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "7px",
};

const sidebarLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  borderRadius: "7px",
  textDecoration: "none",
  fontSize: "14px",
};

const mainStyle = {
  flex: 1,
  minWidth: 0,
  padding: "30px 40px",
  boxSizing: "border-box",
};

const backLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  marginBottom: "20px",
  color: "#64748b",
  textDecoration: "none",
  fontSize: "13px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  marginBottom: "30px",
};

const titleStyle = {
  margin: 0,
  color: "#111827",
  fontSize: "28px",
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
  fontSize: "13px",
};

const sectionStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "25px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "20px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#1e293b",
  fontSize: "19px",
};

const actionsStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "7px",
  padding: "9px 12px",
  borderRadius: "7px",
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#334155",
  cursor: "pointer",
};

const primaryButtonStyle = {
  ...secondaryButtonStyle,
  background: "#2563eb",
  color: "#fff",
  borderColor: "#2563eb",
};

const errorStyle = {
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "12px",
  marginBottom: "15px",
  fontSize: "13px",
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const notificationStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  padding: "17px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const iconBoxStyle = {
  width: "42px",
  height: "42px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "9px",
  background: "#eff6ff",
  color: "#2563eb",
};

const notificationTitleStyle = {
  margin: 0,
  color: "#1e293b",
  fontSize: "14px",
};

const messageStyle = {
  margin: "6px 0",
  color: "#64748b",
  fontSize: "13px",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
};

const dateStyle = {
  margin: "6px 0",
  color: "#94a3b8",
  fontSize: "11px",
};

const unreadDotStyle = {
  display: "inline-block",
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#2563eb",
  marginLeft: "8px",
};

const textButtonStyle = {
  padding: 0,
  marginTop: "5px",
  border: "none",
  background: "transparent",
  color: "#2563eb",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const emptyStyle = {
  padding: "35px 20px",
  textAlign: "center",
  color: "#64748b",
  border: "1px dashed #cbd5e1",
  borderRadius: "10px",
  fontSize: "13px",
};

export default OfficerNotifications;
