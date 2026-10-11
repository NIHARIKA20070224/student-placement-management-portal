import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  User,
  Bell,
  LogOut,
  Briefcase,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const savedApplications = JSON.parse(
      localStorage.getItem("applications") || "[]"
    );

    const savedDrives = JSON.parse(
      localStorage.getItem("placementDrives") || "[]"
    );

    setApplications(savedApplications);
    setDrives(savedDrives);

    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    fetch("http://localhost:5000/api/student/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStudent(data.student);
        }
      })
      .catch((error) => {
        console.error("Failed to load student profile:", error);
      });
  }, []);

  const totalApplications = applications.length;

  const selectedApplications = applications.filter(
    (application) => application.status === "Selected"
  ).length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status === "Applied" ||
      application.status === "Under Review" ||
      application.status === "Shortlisted"
  ).length;

  const activeDrives = drives.filter(
    (drive) =>
      drive.status === "Upcoming" ||
      drive.status === "Open"
  );

  const recentApplications = [...applications]
    .reverse()
    .slice(0, 4);

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
          <SidebarLink
            to="/student"
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            active
          />

          <SidebarLink
            to="/student/companies"
            icon={<Building2 size={18} />}
            text="Companies"
          />

          <SidebarLink
            to="/student/drives"
            icon={<Calendar size={18} />}
            text="Placement Drives"
          />

          <SidebarLink
            to="/student/applications"
            icon={<FileText size={18} />}
            text="My Applications"
          />

          <SidebarLink
            to="/student/profile"
            icon={<User size={18} />}
            text="My Profile"
          />

          <SidebarLink
            to="/student/notifications"
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

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: "30px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "28px",
              }}
            >
              Student Dashboard
            </h1>

            <p
              style={{
                marginTop: "8px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              {student
                ? `Welcome, ${student.full_name}. Track your placement opportunities and applications.`
                : "Track your placement opportunities and applications."}
            </p>
          </div>

          {/* Notification Bell */}
          <Link
            to="/student/notifications"
            style={{
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
            }}
          >
            <Bell size={19} />
          </Link>
        </div>

        {/* Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <StatCard
            icon={<FileText size={22} />}
            title="Total Applications"
            value={totalApplications}
          />

          <StatCard
            icon={<Clock size={22} />}
            title="Pending Applications"
            value={pendingApplications}
          />

          <StatCard
            icon={<CheckCircle size={22} />}
            title="Selected"
            value={selectedApplications}
          />

          <StatCard
            icon={<Building2 size={22} />}
            title="Eligible Companies"
            value="12"
          />
        </div>

        {/* Quick Access */}
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "30px",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                margin: 0,
                color: "#1e293b",
                fontSize: "19px",
              }}
            >
              Quick Access
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              Access your most important placement features.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            <QuickAction
              to="/student/companies"
              icon={<Building2 size={20} />}
              title="Browse Companies"
              description="Explore available companies"
            />

            <QuickAction
              to="/student/drives"
              icon={<Calendar size={20} />}
              title="Placement Drives"
              description="View upcoming drives"
            />

            <QuickAction
              to="/student/applications"
              icon={<FileText size={20} />}
              title="My Applications"
              description="Track your applications"
            />
          </div>
        </section>

        {/* Upcoming Placement Drives */}
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "19px",
                }}
              >
                Upcoming Placement Drives
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Placement opportunities currently available.
              </p>
            </div>

            <Link
              to="/student/drives"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                color: "#2563eb",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              View all
              <Eye size={15} />
            </Link>
          </div>

          {activeDrives.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                border: "1px dashed #cbd5e1",
                borderRadius: "10px",
              }}
            >
              <Calendar
                size={35}
                color="#94a3b8"
                style={{
                  marginBottom: "10px",
                }}
              />

              <h3
                style={{
                  margin: "0 0 6px",
                  color: "#334155",
                  fontSize: "16px",
                }}
              >
                No Upcoming Drives
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                New placement drives will appear here.
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
              {activeDrives.slice(0, 4).map((drive) => (
                <div
                  key={drive.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    padding: "16px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "9px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Briefcase size={19} />
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#1e293b",
                          fontSize: "15px",
                        }}
                      >
                        {drive.company}
                      </h3>

                      <p
                        style={{
                          margin: "4px 0 0",
                          color: "#64748b",
                          fontSize: "12px",
                        }}
                      >
                        {drive.title}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#64748b",
                        fontSize: "12px",
                      }}
                    >
                      <Calendar size={15} />
                      {drive.date}
                    </div>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: "20px",
                        background:
                          drive.status === "Open"
                            ? "#ecfdf5"
                            : "#eff6ff",
                        color:
                          drive.status === "Open"
                            ? "#059669"
                            : "#2563eb",
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {drive.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Application Status */}
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "25px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "19px",
                }}
              >
                Application Status
              </h2>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Track the latest updates on your applications.
              </p>
            </div>

            <Link
              to="/student/applications"
              style={{
                color: "#2563eb",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              View all
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div
              style={{
                padding: "35px 20px",
                textAlign: "center",
                border: "1px dashed #cbd5e1",
                borderRadius: "10px",
              }}
            >
              <FileText
                size={35}
                color="#94a3b8"
                style={{
                  marginBottom: "10px",
                }}
              />

              <h3
                style={{
                  margin: "0 0 6px",
                  color: "#334155",
                  fontSize: "16px",
                }}
              >
                No Applications Yet
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Your company applications will appear here.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {recentApplications.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
          )}
        </section>

        {/* Stay Updated */}
        <section
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
            padding: "22px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "10px",
                background: "white",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={21} />
            </div>

            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#1e3a8a",
                  fontSize: "16px",
                }}
              >
                Stay Updated
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                Check the Placement Drives section regularly for new
                opportunities.
              </p>
            </div>

            <Link
              to="/student/drives"
              style={{
                marginLeft: "auto",
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                padding: "10px 15px",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              View Drives
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function SidebarLink({
  to,
  icon,
  text,
  active = false,
}) {
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

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "9px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "15px",
        }}
      >
        {icon}
      </div>

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: "13px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: "6px 0 0",
          color: "#111827",
          fontSize: "25px",
        }}
      >
        {value}
      </h2>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  description,
}) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        border: "1px solid #e2e8f0",
        borderRadius: "9px",
        padding: "18px",
        color: "#1e293b",
        background: "white",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "8px",
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "12px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          margin: 0,
          fontSize: "14px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "5px 0 0",
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {description}
      </p>
    </Link>
  );
}

function ApplicationRow({ application }) {
  let statusBackground = "#eff6ff";
  let statusColor = "#2563eb";

  if (application.status === "Selected") {
    statusBackground = "#ecfdf5";
    statusColor = "#059669";
  }

  if (application.status === "Rejected") {
    statusBackground = "#fef2f2";
    statusColor = "#dc2626";
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px",
        border: "1px solid #e2e8f0",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "13px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            background: "#eff6ff",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Briefcase size={18} />
        </div>

        <div>
          <h3
            style={{
              margin: 0,
              color: "#1e293b",
              fontSize: "14px",
            }}
          >
            {application.company}
          </h3>

          <p
            style={{
              margin: "4px 0 0",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            {application.appliedDate}
          </p>
        </div>
      </div>

      <span
        style={{
          padding: "5px 10px",
          borderRadius: "20px",
          background: statusBackground,
          color: statusColor,
          fontSize: "11px",
          fontWeight: "600",
        }}
      >
        {application.status}
      </span>
    </div>
  );
}

export default StudentDashboard;