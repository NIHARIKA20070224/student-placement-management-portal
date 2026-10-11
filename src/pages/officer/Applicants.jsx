
import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  Calendar,
  FileText,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/officer/applications";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
}

function Applicants() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again. Your login token was not found.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load applications.");
      }

      setApplications(
        Array.isArray(data)
          ? data
          : Array.isArray(data.applications)
            ? data.applications
            : []
      );
    } catch (err) {
      console.error("Load applications error:", err);
      setError(err.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    setError("");
    setNotice("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setApplications((current) =>
        current.map((application) =>
          Number(application.id) === Number(applicationId)
            ? { ...application, status: newStatus }
            : application
        )
      );

      setNotice(`Application #${applicationId} updated to ${newStatus}.`);
    } catch (err) {
      console.error("Update status error:", err);
      setError(err.message || "Unable to update application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalApplicants = applications.length;

  const selectedApplicants = applications.filter(
    (application) => application.status === "Selected"
  ).length;

  const rejectedApplicants = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const pendingApplicants = applications.filter((application) =>
    ["Applied", "Under Review", "Shortlisted"].includes(application.status)
  ).length;

  const getCompany = (application) =>
    application.company ||
    application.company_name ||
    application.companyName ||
    (application.drive_id
      ? `Placement Drive #${application.drive_id}`
      : "General Company Application");

  const getDriveTitle = (application) =>
    application.driveTitle ||
    application.drive_title ||
    application.title ||
    "Placement Drive";

  const formatDate = (value) => {
    if (!value) return "Not provided";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleDateString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: "30px" }}>
        <h1
          style={{
            margin: "0 0 8px",
            color: "#0f172a",
            fontSize: "30px",
          }}
        >
          Applicants
        </h1>

        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
          Review student applications and update their placement status.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: "14px",
            borderRadius: "8px",
            marginBottom: "18px",
          }}
        >
          {error}
          <button
            onClick={loadApplications}
            style={{ marginLeft: "12px", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          style={{
            background: "#ecfdf5",
            color: "#047857",
            padding: "14px",
            borderRadius: "8px",
            marginBottom: "18px",
          }}
        >
          {notice}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "18px",
          marginBottom: "30px",
        }}
      >
        <SummaryCard
          icon={<Users size={21} />}
          title="Total Applicants"
          value={totalApplicants}
        />
        <SummaryCard
          icon={<Clock size={21} />}
          title="Pending"
          value={pendingApplicants}
        />
        <SummaryCard
          icon={<CheckCircle size={21} />}
          title="Selected"
          value={selectedApplicants}
        />
        <SummaryCard
          icon={<XCircle size={21} />}
          title="Rejected"
          value={rejectedApplicants}
        />
      </div>

      {loading ? (
        <div
          style={{
            background: "white",
            padding: "45px",
            textAlign: "center",
            borderRadius: "12px",
            color: "#64748b",
          }}
        >
          Loading applications...
        </div>
      ) : applications.length === 0 && !error ? (
        <div
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <Users size={45} color="#94a3b8" />
          <h2 style={{ color: "#1e293b" }}>No applicants yet</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Student applications will appear here after they apply.
          </p>
          <button
            onClick={loadApplications}
            style={{
              marginTop: "12px",
              padding: "10px 16px",
              background: "#2563eb",
              color: "white",
              border: 0,
              borderRadius: "7px",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              updateStatus={updateStatus}
              updating={Number(updatingId) === Number(application.id)}
              getCompany={getCompany}
              getDriveTitle={getDriveTitle}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  application,
  updateStatus,
  updating,
  getCompany,
  getDriveTitle,
  formatDate,
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
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
        <div>
          <h2 style={{ margin: "0 0 6px", color: "#1e293b", fontSize: "19px" }}>
            {application.full_name || application.fullName || "Student"}
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
            Roll Number: {application.roll_number || application.rollNumber || "Not provided"}
          </p>
          <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "12px" }}>
            Application ID: #{application.id}
          </p>
        </div>

        <select
          aria-label={`Status for application ${application.id}`}
          value={application.status || "Applied"}
          disabled={updating}
          onChange={(event) =>
            updateStatus(application.id, event.target.value)
          }
          style={{
            padding: "9px 12px",
            borderRadius: "7px",
            border: "1px solid #cbd5e1",
            background: "white",
            color: "#334155",
            fontSize: "13px",
            cursor: updating ? "wait" : "pointer",
          }}
        >
          <option value="Applied">Applied</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {updating && (
        <p style={{ color: "#64748b", fontSize: "12px" }}>
          Saving status...
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginTop: "22px",
        }}
      >
        <InfoBox
          icon={<Building2 size={17} />}
          label="Company"
          value={getCompany(application)}
        />
        <InfoBox
          icon={<FileText size={17} />}
          label="Placement Drive"
          value={getDriveTitle(application)}
        />
        <DetailItem
          label="Email"
          value={application.email}
        />
        <DetailItem
          label="Phone"
          value={application.phone}
        />
        <DetailItem
          label="Branch"
          value={application.branch}
        />
        <DetailItem
          label="CGPA"
          value={application.cgpa}
        />
        <DetailItem
          label="Skills"
          value={application.skills}
        />
        <DetailItem
          label="Applied On"
          value={formatDate(
            application.created_at ||
            application.appliedDate ||
            application.applied_date
          )}
        />
      </div>

      {application.venue && (
        <p style={{ marginTop: "15px", color: "#475569", fontSize: "13px" }}>
          <strong>Drive Venue:</strong> {application.venue}
        </p>
      )}

      <div
        style={{
          marginTop: "18px",
          paddingTop: "18px",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#475569",
          fontSize: "13px",
        }}
      >
        <FileText size={17} color="#2563eb" />
        <span>
          <strong>Resume:</strong>{" "}
          {application.resume_name || application.resumeName || "Resume not available"}
        </span>
      </div>

      {application.message && (
        <div
          style={{
            marginTop: "15px",
            padding: "14px",
            background: "#f8fafc",
            borderRadius: "8px",
            color: "#475569",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          <strong>Additional Information</strong>
          <div style={{ marginTop: "5px" }}>{application.message}</div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon, title, value }) {
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
          marginBottom: "14px",
        }}
      >
        {icon}
      </div>
      <div style={{ color: "#64748b", fontSize: "13px", marginBottom: "5px" }}>
        {title}
      </div>
      <div style={{ color: "#0f172a", fontSize: "25px", fontWeight: "700" }}>
        {value}
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div style={{ padding: "13px", background: "#f8fafc", borderRadius: "8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          color: "#2563eb",
          fontSize: "12px",
          marginBottom: "6px",
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ color: "#334155", fontSize: "13px", fontWeight: "600" }}>
        {value || "Not provided"}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div style={{ color: "#94a3b8", fontSize: "11px", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ color: "#475569", fontSize: "13px" }}>
        {value ?? "Not provided"}
      </div>
    </div>
  );
}

export default Applicants;
