
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  Bell,
  LogOut,
  Plus,
  Briefcase,
  Clock,
  CheckCircle,
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

function getArray(data, keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function OfficerDashboard() {
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Load dashboard information
  const loadDashboardData = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Login token not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    async function loadSection(url, keys, setter, name) {
      const response = await fetch(`${API_BASE}${url}`, { headers });
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || `${name} could not be loaded.`);
      }

      setter(getArray(data, keys));
    }

    try {
      await Promise.all([
        loadSection(
          "/officer/applications",
          ["applications", "data"],
          setApplications,
          "Applications"
        ),
        loadSection(
          "/companies",
          ["companies", "data"],
          setCompanies,
          "Companies"
        ),
        loadSection(
          "/drives",
          ["drives", "placementDrives", "data"],
          setDrives,
          "Placement drives"
        ),
      ]);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(err.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Load unread notification count and refresh every 30 seconds
  useEffect(() => {
    let cancelled = false;

    const loadUnreadCount = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setUnreadCount(Number(data.unreadCount) || 0);
        }
      } catch (err) {
        console.error("Failed to load unread notification count:", err);
      }
    };

    loadUnreadCount();

    const intervalId = setInterval(loadUnreadCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const totalApplicants = applications.length;

  const selectedApplicants = applications.filter(
    (application) => application.status === "Selected"
  ).length;

  const pendingApplicants = applications.filter((application) =>
    ["Applied", "Under Review", "Shortlisted"].includes(application.status)
  ).length;

  const activeDrives = drives.filter((drive) =>
    ["Upcoming", "Open"].includes(drive.status || drive.drive_status)
  );

  const recentApplicants = applications.slice(0, 5);

  return (
    <div style={pageStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={brandStyle}>CareerConnect</div>

        <nav style={navStyle}>
          <SidebarLink
            to="/officer"
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            active
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
          />

          <SidebarLink
            to="/login"
            icon={<LogOut size={18} />}
            text="Logout"
          />
        </nav>
      </aside>

      {/* Main content */}
      <main style={mainStyle}>
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Placement Officer Dashboard</h1>
            <p style={descriptionStyle}>
              Manage companies, placement drives and student applications.
            </p>
          </div>

          {/* Notification bell with unread badge */}
          <Link
            to="/officer/notifications"
            aria-label={`Notifications${
              unreadCount > 0 ? `, ${unreadCount} unread` : ""
            }`}
            title="Notifications"
            style={{ ...bellStyle, position: "relative" }}
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span style={badgeStyle}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </header>

        {error && (
          <div role="alert" style={errorStyle}>
            {error}
            <button
              onClick={loadDashboardData}
              style={retryButtonStyle}
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}
        <section style={statsGridStyle}>
          <StatCard
            icon={<Building2 size={22} />}
            title="Total Companies"
            value={loading ? "..." : companies.length}
          />

          <StatCard
            icon={<Calendar size={22} />}
            title="Active Drives"
            value={loading ? "..." : activeDrives.length}
          />

          <StatCard
            icon={<Users size={22} />}
            title="Total Applicants"
            value={loading ? "..." : totalApplicants}
          />

          <StatCard
            icon={<CheckCircle size={22} />}
            title="Selected Students"
            value={loading ? "..." : selectedApplicants}
          />
        </section>

        {/* Quick actions */}
        <section style={sectionStyle}>
          <SectionHeading
            title="Quick Actions"
            subtitle="Common placement management tasks."
          />

          <div style={quickGridStyle}>
            <QuickAction
              to="/officer/companies"
              icon={<Building2 size={20} />}
              title="Manage Companies"
              description="Add or update companies"
            />

            <QuickAction
              to="/officer/drives"
              icon={<Plus size={20} />}
              title="Create Placement Drive"
              description="Schedule a new drive"
            />

            <QuickAction
              to="/officer/applicants"
              icon={<Users size={20} />}
              title="View Applicants"
              description="Review student applications"
            />

            <QuickAction
              to="/officer/notifications"
              icon={<Bell size={20} />}
              title="View Notifications"
              description="Check placement updates"
            />
          </div>
        </section>

        {/* Active placement drives */}
        <section style={sectionStyle}>
          <SectionHeading
            title="Active Placement Drives"
            subtitle="Upcoming and currently open placement drives."
            linkTo="/officer/drives"
          />

          {loading ? (
            <EmptyMessage message="Loading placement drives..." />
          ) : activeDrives.length === 0 ? (
            <EmptyMessage
              title="No Active Placement Drives"
              message="Create a placement drive to display it here."
            />
          ) : (
            <div style={listStyle}>
              {activeDrives.slice(0, 5).map((drive, index) => {
                const status =
                  drive.status || drive.drive_status || "Upcoming";

                const company =
                  drive.company ||
                  drive.company_name ||
                  drive.companyName ||
                  "Company";

                const role =
                  drive.title ||
                  drive.drive_title ||
                  drive.job_title ||
                  drive.role ||
                  "Placement Drive";

                const date =
                  drive.date ||
                  drive.drive_date ||
                  drive.start_date ||
                  "Date not available";

                return (
                  <div
                    key={drive.id || drive.drive_id || index}
                    style={listItemStyle}
                  >
                    <div style={itemLeftStyle}>
                      <div style={iconBoxStyle}>
                        <Briefcase size={19} />
                      </div>

                      <div>
                        <h3 style={itemTitleStyle}>{company}</h3>
                        <p style={descriptionStyle}>{role}</p>
                      </div>
                    </div>

                    <div style={itemRightStyle}>
                      <span style={dateStyle}>
                        <Clock size={15} />
                        {String(date).slice(0, 10)}
                      </span>

                      <span
                        style={{
                          ...statusStyle,
                          background:
                            status === "Open" ? "#ecfdf5" : "#eff6ff",
                          color:
                            status === "Open" ? "#059669" : "#2563eb",
                        }}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent applicants */}
        <section style={sectionStyle}>
          <SectionHeading
            title="Recent Applicants"
            subtitle="Latest student applications."
            linkTo="/officer/applicants"
          />

          {loading ? (
            <EmptyMessage message="Loading applicants..." />
          ) : applications.length === 0 ? (
            <EmptyMessage
              title="No Applicants Yet"
              message="Student applications will appear here."
            />
          ) : (
            <div style={listStyle}>
              {recentApplicants.map((application, index) => {
                const name =
                  application.full_name ||
                  application.fullName ||
                  application.student_name ||
                  "Unknown Student";

                const status = application.status || "Applied";

                const company =
                  application.company ||
                  application.company_name ||
                  (application.drive_id
                    ? `Drive ID: ${application.drive_id}`
                    : "Placement application");

                const selected = status === "Selected";
                const rejected = status === "Rejected";

                return (
                  <div
                    key={application.id || index}
                    style={listItemStyle}
                  >
                    <div>
                      <h3 style={itemTitleStyle}>{name}</h3>
                      <p style={descriptionStyle}>{company}</p>

                      {application.roll_number && (
                        <p style={descriptionStyle}>
                          Roll Number: {application.roll_number}
                        </p>
                      )}
                    </div>

                    <span
                      style={{
                        ...statusStyle,
                        background: selected
                          ? "#ecfdf5"
                          : rejected
                          ? "#fef2f2"
                          : "#eff6ff",
                        color: selected
                          ? "#059669"
                          : rejected
                          ? "#b91c1c"
                          : "#2563eb",
                      }}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && pendingApplicants > 0 && (
            <p style={descriptionStyle}>
              {pendingApplicants} application(s) awaiting a final decision.
            </p>
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
        color: active ? "white" : "#cbd5e1",
        background: active ? "#2563eb" : "transparent",
      }}
    >
      {icon}
      {text}
    </Link>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div style={statCardStyle}>
      <div style={iconBoxStyle}>{icon}</div>
      <p style={descriptionStyle}>{title}</p>
      <h2 style={statValueStyle}>{value}</h2>
    </div>
  );
}

function SectionHeading({ title, subtitle, linkTo }) {
  return (
    <div style={sectionHeaderStyle}>
      <div>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <p style={descriptionStyle}>{subtitle}</p>
      </div>

      {linkTo && (
        <Link to={linkTo} style={viewAllStyle}>
          View all
        </Link>
      )}
    </div>
  );
}

function QuickAction({ to, icon, title, description }) {
  return (
    <Link to={to} style={quickActionStyle}>
      <div style={iconBoxStyle}>{icon}</div>
      <h3 style={itemTitleStyle}>{title}</h3>
      <p style={descriptionStyle}>{description}</p>
    </Link>
  );
}

function EmptyMessage({ title, message }) {
  return (
    <div style={emptyStyle}>
      {title && <h3 style={itemTitleStyle}>{title}</h3>}
      <p style={descriptionStyle}>{message}</p>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f6f8fb",
  fontFamily: "Arial, sans-serif",
  display: "flex",
};

const sidebarStyle = {
  width: "240px",
  minHeight: "100vh",
  background: "#0f172a",
  color: "white",
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

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "30px",
};

const titleStyle = {
  margin: 0,
  color: "#111827",
  fontSize: "28px",
};

const descriptionStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "13px",
};

const bellStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  background: "white",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  textDecoration: "none",
  flexShrink: 0,
};

const badgeStyle = {
  position: "absolute",
  top: "-6px",
  right: "-6px",
  minWidth: "19px",
  height: "19px",
  padding: "0 4px",
  borderRadius: "999px",
  background: "#dc2626",
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
};

const errorStyle = {
  padding: "14px 16px",
  marginBottom: "20px",
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#b91c1c",
  borderRadius: "8px",
  fontSize: "14px",
};

const retryButtonStyle = {
  marginLeft: "12px",
  padding: "6px 10px",
  cursor: "pointer",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const statCardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "20px",
};

const statValueStyle = {
  margin: "6px 0 0",
  color: "#111827",
  fontSize: "25px",
};

const sectionStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "25px",
  marginBottom: "30px",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  marginBottom: "20px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#1e293b",
  fontSize: "19px",
};

const viewAllStyle = {
  color: "#2563eb",
  textDecoration: "none",
  fontSize: "13px",
  fontWeight: "600",
  flexShrink: 0,
};

const quickGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "15px",
};

const quickActionStyle = {
  textDecoration: "none",
  border: "1px solid #e2e8f0",
  borderRadius: "9px",
  padding: "18px",
  color: "#1e293b",
  background: "white",
};

const iconBoxStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "9px",
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "12px",
};

const itemTitleStyle = {
  margin: 0,
  color: "#1e293b",
  fontSize: "14px",
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const listItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  padding: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  flexWrap: "wrap",
};

const itemLeftStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const itemRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const dateStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  color: "#64748b",
  fontSize: "12px",
};

const statusStyle = {
  padding: "5px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "600",
};

const emptyStyle = {
  padding: "35px 20px",
  textAlign: "center",
  border: "1px dashed #cbd5e1",
  borderRadius: "10px",
};

export default OfficerDashboard;
