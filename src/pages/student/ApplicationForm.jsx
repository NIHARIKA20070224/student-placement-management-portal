
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const initialForm = {
  fullName: "",
  rollNumber: "",
  email: "",
  phone: "",
  branch: "",
  cgpa: "",
  skills: "",
  message: "",
};

function ApplicationForm() {
  const { companyName } = useParams();
  const location = useLocation();

  const [drive, setDrive] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in as a student and try again.");
        }

        const [profileResponse, drivesResponse] = await Promise.all([
          fetch(`${API_URL}/student/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/drives`),
        ]);

        const profileData = await profileResponse.json();
        const drivesData = await drivesResponse.json();

        if (!profileResponse.ok || !profileData.success) {
          throw new Error(
            profileData.message || "Could not load your student profile."
          );
        }

        if (!drivesResponse.ok || !drivesData.success) {
          throw new Error(
            drivesData.message || "Could not load placement drives."
          );
        }

        const availableDrives = Array.isArray(drivesData.drives)
          ? drivesData.drives
          : [];

        const requestedDriveId = location.state?.driveId;

        let selectedDrive = null;

        if (requestedDriveId != null) {
          selectedDrive = availableDrives.find(
            (item) => String(item.id) === String(requestedDriveId)
          );
        }

        if (!selectedDrive) {
          const decodedCompanyName = decodeURIComponent(
            companyName || ""
          ).replace(/-/g, " ");

          selectedDrive = availableDrives.find(
            (item) =>
              String(item.company || "").toLowerCase() ===
                decodedCompanyName.toLowerCase() &&
              ["open", "upcoming"].includes(
                String(item.status || "").toLowerCase()
              )
          );
        }

        if (!selectedDrive || !Number.isInteger(Number(selectedDrive.id))) {
          throw new Error(
            "No valid placement drive was found for this company. Return to Placement Drives and select the drive again."
          );
        }

        const student = profileData.student || {};

        if (!cancelled) {
          setDrive(selectedDrive);
          setFormData({
            fullName: student.full_name || "",
            rollNumber: student.roll_number || "",
            email: student.email || "",
            phone: student.phone || "",
            branch: student.branch || "",
            cgpa:
              student.cgpa === null || student.cgpa === undefined
                ? ""
                : String(student.cgpa),
            skills: "",
            message: "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load application data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [companyName, location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!drive || !Number.isInteger(Number(drive.id))) {
      setError(
        "A valid placement drive was not selected. Return to Placement Drives and select the drive again."
      );
      return;
    }

    if (!resume) {
      setError("Please select your resume before submitting.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your login session is missing. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/student/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driveId: Number(drive.id),
          fullName: formData.fullName.trim(),
          rollNumber: formData.rollNumber.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          branch: formData.branch.trim(),
          cgpa: formData.cgpa,
          skills: formData.skills.trim(),
          message: formData.message.trim(),
          resumeName: resume.name,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to submit application."
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f7fb",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
      color: "#111827",
    },
    container: {
      maxWidth: "900px",
      margin: "0 auto",
    },
    back: {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      color: "#2563eb",
      textDecoration: "none",
      marginBottom: "18px",
      fontSize: "14px",
    },
    card: {
      background: "#fff",
      border: "1px solid #dce4ef",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "16px",
    },
    heading: {
      margin: "0 0 8px",
      fontSize: "23px",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "13px",
      margin: 0,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "18px",
    },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: 600,
      marginBottom: "7px",
    },
    input: {
      boxSizing: "border-box",
      width: "100%",
      padding: "10px",
      border: "1px solid #cbd5e1",
      borderRadius: "6px",
      fontSize: "13px",
      background: "#fff",
    },
    alert: {
      padding: "12px",
      borderRadius: "7px",
      marginBottom: "16px",
      fontSize: "13px",
    },
    button: {
      width: "100%",
      padding: "12px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "7px",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>Loading application details...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.container, ...styles.card, textAlign: "center" }}>
          <CheckCircle size={48} color="#16a34a" />
          <h2>Application Submitted!</h2>
          <p>Your application has been saved successfully.</p>
          <Link to="/student/drives" style={styles.back}>
            <ArrowLeft size={16} />
            Back to Placement Drives
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link to="/student/drives" style={styles.back}>
          <ArrowLeft size={16} />
          Back to Placement Drives
        </Link>

        <section style={styles.card}>
          <h1 style={styles.heading}>
            Apply for {drive?.company || companyName}
          </h1>
          <p style={styles.subtitle}>
            {drive?.title || "Placement Application"}
          </p>
          <p style={styles.subtitle}>
            Drive ID: {drive?.id}
          </p>
        </section>

        {error && (
          <div
            role="alert"
            style={{
              ...styles.alert,
              color: "#b91c1c",
              background: "#fef2f2",
              border: "1px solid #fecaca",
            }}
          >
            <AlertCircle
              size={15}
              style={{ verticalAlign: "middle", marginRight: "6px" }}
            />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section style={styles.card}>
            <h3>Student Information</h3>

            <div style={styles.grid}>
              {[
                ["fullName", "Full Name", "text"],
                ["rollNumber", "Roll Number", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone Number", "tel"],
                ["branch", "Branch", "text"],
                ["cgpa", "CGPA", "number"],
              ].map(([name, label, type]) => (
                <div key={name}>
                  <label htmlFor={name} style={styles.label}>
                    {label}
                  </label>
                  <input
                    id={name}
                    name={name}
                    type={type}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    min={type === "number" ? 0 : undefined}
                    max={type === "number" ? 10 : undefined}
                    step={type === "number" ? "0.01" : undefined}
                    style={styles.input}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: "18px" }}>
              <label htmlFor="skills" style={styles.label}>
                Technical Skills
              </label>
              <input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Example: Java, React, SQL"
                required
                style={styles.input}
              />
            </div>

            <div style={{ marginTop: "18px" }}>
              <label htmlFor="message" style={styles.label}>
                Message / Additional Information
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Enter any additional information..."
                style={{ ...styles.input, resize: "vertical" }}
              />
            </div>

            <div style={{ marginTop: "18px" }}>
              <label htmlFor="resume" style={styles.label}>
                Resume (PDF, DOC or DOCX)
              </label>
              <label
                htmlFor="resume"
                style={{
                  ...styles.input,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  padding: "14px",
                }}
              >
                <Upload size={18} color="#2563eb" />
                <span>{resume ? resume.name : "Choose resume file"}</span>
              </label>
              <input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(event) =>
                  setResume(event.target.files?.[0] || null)
                }
                required
                style={{
                  position: "absolute",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                }}
              />
              {resume && (
                <p style={{ color: "#15803d", fontSize: "12px" }}>
                  <FileText
                    size={14}
                    style={{ verticalAlign: "middle", marginRight: "5px" }}
                  />
                  {resume.name}
                </p>
              )}
              <p style={{ color: "#64748b", fontSize: "11px" }}>
                This version records the resume filename. Actual file upload
                storage requires a separate backend upload endpoint.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !drive}
              style={{
                ...styles.button,
                marginTop: "18px",
                opacity: submitting || !drive ? 0.65 : 1,
              }}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </button>
          </section>
        </form>
      </div>
    </div>
  );
}

export default ApplicationForm;
