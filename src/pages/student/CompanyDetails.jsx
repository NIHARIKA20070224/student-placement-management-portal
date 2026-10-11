import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  BriefcaseBusiness,
  MapPin,
  IndianRupee,
  CalendarDays,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function CompanyDetails() {
  const { companyName } = useParams();
  const navigate = useNavigate();

  const decodedCompanyName = decodeURIComponent(companyName || "");

  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [companiesResponse, drivesResponse] = await Promise.all([
          fetch(`${API_URL}/companies`),
          fetch(`${API_URL}/drives`),
        ]);

        const companiesData = await companiesResponse.json();
        const drivesData = await drivesResponse.json();

        if (
          !companiesResponse.ok ||
          !companiesData.success ||
          !Array.isArray(companiesData.companies)
        ) {
          throw new Error("Could not load company details.");
        }

        if (
          !drivesResponse.ok ||
          !drivesData.success ||
          !Array.isArray(drivesData.drives)
        ) {
          throw new Error("Could not load placement opportunities.");
        }

        // Get EVERY database record for this company.
        const matchingCompanies = companiesData.companies.filter(
          (item) =>
            String(item.name || "").trim().toLowerCase() ===
            decodedCompanyName.trim().toLowerCase()
        );

        if (matchingCompanies.length === 0) {
          throw new Error("Company not found.");
        }

        const matchingCompanyIds = new Set(
          matchingCompanies.map((item) => String(item.id))
        );

        // Show open or upcoming drives associated with this company.
        const companyDrives = drivesData.drives.filter((drive) => {
          const sameCompany =
            matchingCompanyIds.has(String(drive.company_id)) ||
            String(drive.company || "").trim().toLowerCase() ===
              decodedCompanyName.trim().toLowerCase();

          const activeStatus = ["open", "upcoming"].includes(
            String(drive.status || "").trim().toLowerCase()
          );

          return sameCompany && activeStatus;
        });

        if (!cancelled) {
          setCompanies(matchingCompanies);
          setDrives(companyDrives);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load company information.");
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
  }, [decodedCompanyName]);

  const applyForDrive = (drive) => {
    if (!drive?.id) {
      setError("This placement drive has no valid database ID.");
      return;
    }

    navigate(
      `/student/apply/${encodeURIComponent(decodedCompanyName)}`,
      {
        state: { driveId: drive.id },
      }
    );
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f5f7fb",
      padding: "28px",
      fontFamily: "Arial, sans-serif",
      color: "#0f172a",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    panel: {
      background: "#fff",
      border: "1px solid #dfe7f1",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "18px",
    },
    button: {
      display: "inline-flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      padding: "11px 16px",
      background: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "7px",
      textDecoration: "none",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
    },
    muted: {
      color: "#64748b",
      fontSize: "13px",
      lineHeight: 1.6,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: "12px",
    },
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          Loading company and job opportunities...
        </div>
      </div>
    );
  }

  if (error && companies.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <Link to="/student/companies" style={styles.muted}>
            <ArrowLeft size={15} /> Back to Companies
          </Link>

          <section style={{ ...styles.panel, marginTop: "20px" }}>
            <AlertCircle color="#dc2626" />
            <h2>Unable to load company</h2>
            <p style={styles.muted}>{error}</p>
          </section>
        </div>
      </div>
    );
  }

  const company = companies[0];

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <Link
          to="/student/companies"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            color: "#2563eb",
            textDecoration: "none",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          <ArrowLeft size={16} />
          Back to Companies
        </Link>

        {/* Company heading */}
        <section style={styles.panel}>
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
                display: "grid",
                placeItems: "center",
                background: "#eff6ff",
                color: "#2563eb",
                borderRadius: "10px",
              }}
            >
              <Building2 size={27} />
            </div>

            <div>
              <h1 style={{ margin: "0 0 7px", fontSize: "27px" }}>
                {company.name}
              </h1>
              <p style={{ ...styles.muted, margin: 0 }}>
                Company profile and all available job roles
              </p>
            </div>
          </div>
        </section>

        {/* All roles for this company */}
        <div style={{ margin: "28px 0 16px" }}>
          <h2 style={{ margin: "0 0 7px", fontSize: "22px" }}>
            Available Job Roles
          </h2>
          <p style={styles.muted}>
            {companies.length} role record
            {companies.length === 1 ? "" : "s"} at {company.name}
          </p>
        </div>

        <div style={styles.grid}>
          {companies.map((role, index) => (
            <section
              key={role.id ?? `${role.role}-${index}`}
              style={{ ...styles.panel, marginBottom: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "18px",
                }}
              >
                <BriefcaseBusiness size={21} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "19px" }}>
                  {role.role || "Job Role"}
                </h3>
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                <Info
                  icon={<IndianRupee size={17} />}
                  label="Package"
                  value={role.package}
                />

                <Info
                  icon={<MapPin size={17} />}
                  label="Location"
                  value={role.location}
                />

                <Info
                  icon={<CheckCircle size={17} />}
                  label="Eligibility"
                  value={role.eligibility}
                />
              </div>

              {role.skills && (
                <div style={{ marginTop: "18px" }}>
                  <h4 style={{ margin: "0 0 7px", fontSize: "14px" }}>
                    Required Skills
                  </h4>
                  <p style={{ ...styles.muted, margin: 0 }}>
                    {role.skills}
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            style={{
              ...styles.panel,
              marginTop: "18px",
              color: "#b91c1c",
              background: "#fef2f2",
            }}
          >
            {error}
          </div>
        )}

        {/* Placement drives */}
        <div style={{ margin: "32px 0 16px" }}>
          <h2 style={{ margin: "0 0 7px", fontSize: "22px" }}>
            Available Placement Drives
          </h2>
          <p style={styles.muted}>
            {drives.length} open or upcoming{" "}
            {drives.length === 1 ? "opportunity" : "opportunities"} at{" "}
            {company.name}
          </p>
        </div>

        {drives.length === 0 ? (
          <section
            style={{
              ...styles.panel,
              textAlign: "center",
              padding: "40px",
            }}
          >
            <BriefcaseBusiness size={35} color="#94a3b8" />
            <h3>No active placement drives yet</h3>
            <p style={styles.muted}>
              The placement officer must create an Open or Upcoming drive
              for this company before students can apply.
            </p>
            <Link to="/student/drives" style={styles.button}>
              Browse Placement Drives
            </Link>
          </section>
        ) : (
          <div style={styles.grid}>
            {drives.map((drive) => (
              <article
                key={drive.id}
                style={{
                  ...styles.panel,
                  marginBottom: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <BriefcaseBusiness size={22} color="#2563eb" />

                  <span
                    style={{
                      background:
                        String(drive.status).toLowerCase() === "open"
                          ? "#dcfce7"
                          : "#dbeafe",
                      color:
                        String(drive.status).toLowerCase() === "open"
                          ? "#166534"
                          : "#1d4ed8",
                      borderRadius: "20px",
                      padding: "5px 9px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    {drive.status}
                  </span>
                </div>

                <h3 style={{ margin: "15px 0 8px", fontSize: "18px" }}>
                  {drive.title || "Placement Opportunity"}
                </h3>

                <p style={styles.muted}>
                  {drive.eligibility ||
                    "Check eligibility with the placement officer."}
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "12px",
                    margin: "12px 0 20px",
                  }}
                >
                  <Info
                    icon={<CalendarDays size={16} />}
                    label="Drive Date"
                    value={drive.date || drive.drive_date}
                  />

                  <Info
                    icon={<Clock size={16} />}
                    label="Application Deadline"
                    value={drive.deadline}
                  />

                  <Info
                    icon={<MapPin size={16} />}
                    label="Venue"
                    value={drive.venue}
                  />
                </div>

                <div style={{ marginTop: "auto" }}>
                  <button
                    type="button"
                    onClick={() => applyForDrive(drive)}
                    style={{ ...styles.button, width: "100%" }}
                  >
                    Apply for This Role
                  </button>
                  <p
                    style={{
                      ...styles.muted,
                      fontSize: "10px",
                      marginBottom: 0,
                      textAlign: "center",
                    }}
                  >
                    Drive ID: {drive.id}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "9px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "12px",
        minWidth: 0,
      }}
    >
      <span style={{ color: "#2563eb", display: "flex" }}>{icon}</span>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "#64748b",
            fontSize: "11px",
            marginBottom: "5px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#0f172a",
            fontSize: "12px",
            fontWeight: 600,
            overflowWrap: "anywhere",
          }}
        >
          {value || "Not specified"}
        </div>
      </div>
    </div>
  );
}

export default CompanyDetails;