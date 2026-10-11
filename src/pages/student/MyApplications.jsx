
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("accessToken");

        if (!token) {
          setError("Please log in again to view your applications.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/student/applications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load applications."
          );
        }

        setApplications(
          Array.isArray(data)
            ? data
            : data.applications || []
        );
      } catch (err) {
        console.error("Error loading applications:", err);
        setError(err.message || "Unable to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || "Applied").toLowerCase();

    if (normalizedStatus === "selected") {
      return {
        background: "#dcfce7",
        color: "#15803d",
        icon: <CheckCircle2 size={15} />,
      };
    }

    if (normalizedStatus === "shortlisted") {
      return {
        background: "#dbeafe",
        color: "#2563eb",
        icon: <CheckCircle2 size={15} />,
      };
    }

    if (
      normalizedStatus === "under review" ||
      normalizedStatus === "under_review"
    ) {
      return {
        background: "#fef3c7",
        color: "#b45309",
        icon: <Clock3 size={15} />,
      };
    }

    if (normalizedStatus === "rejected") {
      return {
        background: "#fee2e2",
        color: "#dc2626",
        icon: <AlertCircle size={15} />,
      };
    }

    return {
      background: "#f1f5f9",
      color: "#475569",
      icon: <Clock3 size={15} />,
    };
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return date.toLocaleDateString();
  };

  const getCompanyName = (application) =>
    application.company_name ||
    application.company ||
    application.title ||
    (application.drive_id
      ? `Placement Drive #${application.drive_id}`
      : "General Application");

  const getPosition = (application) =>
    application.position ||
    application.job_title ||
    application.drive_title ||
    application.title ||
    "Placement Opportunity";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        padding: "35px 50px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <Link
          to="/student"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            background: "white",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: "28px",
            }}
          >
            My Applications
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Track all your placement applications in one place.
          </p>
        </div>
      </div>

      {loading && (
        <div
          style={{
            background: "white",
            padding: "40px",
            textAlign: "center",
            borderRadius: "14px",
            color: "#64748b",
          }}
        >
          Loading your applications...
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            background: "white",
            padding: "25px",
            border: "1px solid #fecaca",
            borderRadius: "14px",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "60px 30px",
            textAlign: "center",
          }}
        >
          <FileText
            size={40}
            color="#2563eb"
            style={{ marginBottom: "15px" }}
          />

          <h2 style={{ color: "#0f172a" }}>
            No Applications Yet
          </h2>

          <p style={{ color: "#64748b", fontSize: "14px" }}>
            You haven't applied to any placement opportunities yet.
          </p>

          <Link
            to="/student/companies"
            style={{
              display: "inline-block",
              marginTop: "15px",
              background: "#2563eb",
              color: "white",
              padding: "11px 20px",
              borderRadius: "7px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Browse Companies
          </Link>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {applications.map((application) => {
            const statusStyle = getStatusStyle(application.status);
            const companyName = getCompanyName(application);
            const position = getPosition(application);

            return (
              <div
                key={application.id}
                style={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "25px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "11px",
                        background: "#eff6ff",
                        color: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "21px",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {companyName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2
                        style={{
                          margin: 0,
                          color: "#0f172a",
                          fontSize: "19px",
                        }}
                      >
                        {companyName}
                      </h2>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        {application.full_name || "Student"}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: statusStyle.background,
                      color: statusStyle.color,
                      padding: "7px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {statusStyle.icon}
                    {application.status || "Applied"}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "20px",
                    marginTop: "25px",
                    paddingTop: "20px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <ApplicationDetail
                    icon={<Briefcase size={17} />}
                    label="Position"
                    value={position}
                  />

                  <ApplicationDetail
                    icon={<MapPin size={17} />}
                    label="Branch"
                    value={application.branch || "Not available"}
                  />

                  <ApplicationDetail
                    icon={<CalendarDays size={17} />}
                    label="Applied On"
                    value={formatDate(
                      application.applied_at ||
                      application.applied_date ||
                      application.created_at
                    )}
                  />

                  <ApplicationDetail
                    icon={<FileText size={17} />}
                    label="Resume"
                    value={
                      application.resume_name ||
                      application.resumeName ||
                      "Not available"
                    }
                  />
                </div>

                <div
                  style={{
                    marginTop: "22px",
                    paddingTop: "18px",
                    borderTop: "1px solid #f1f5f9",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Application ID: #{application.id}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ApplicationDetail({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: "9px", minWidth: 0 }}>
      <span style={{ color: "#2563eb", flexShrink: 0 }}>
        {icon}
      </span>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "#94a3b8",
            fontSize: "11px",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#334155",
            fontSize: "13px",
            fontWeight: "600",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={String(value ?? "")}
        >
          {value || "Not available"}
        </div>
      </div>
    </div>
  );
}

export default MyApplications;
