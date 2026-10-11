
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Building2,
  ExternalLink,
  Briefcase,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDrives() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/drives`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load placement drives.");
        }

        const activeDrives = (data.drives || [])
          .filter(
            (drive) =>
              drive.status === "Upcoming" || drive.status === "Open"
          )
          .map((drive) => ({
            ...drive,
            id: Number(drive.id),
            company_id: Number(drive.company_id),
            company: drive.company || "",
            date: String(drive.date || drive.drive_date || "").slice(0, 10),
            deadline: drive.deadline
              ? String(drive.deadline).slice(0, 10)
              : "",
          }));

        if (!cancelled) {
          setDrives(activeDrives);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load placement drives.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDrives();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDrives = drives.filter((drive) => {
    const searchText = search.toLowerCase();

    return (
      drive.company?.toLowerCase().includes(searchText) ||
      drive.title?.toLowerCase().includes(searchText) ||
      drive.eligibility?.toLowerCase().includes(searchText) ||
      drive.venue?.toLowerCase().includes(searchText)
    );
  });

  const getStatusStyle = (status) =>
    status === "Open"
      ? { background: "#dcfce7", color: "#15803d" }
      : { background: "#dbeafe", color: "#1d4ed8" };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <div style={styles.titleRow}>
              <Briefcase size={28} color="#2563eb" />
              <h1 style={styles.title}>Placement Drives</h1>
            </div>

            <p style={styles.subtitle}>
              Explore upcoming placement opportunities and apply for drives
              you are eligible for.
            </p>
          </div>

          <Link to="/student" style={styles.dashboardButton}>
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.searchSection}>
          <div style={styles.searchBox}>
            <Search size={20} color="#64748b" />
            <input
              type="text"
              placeholder="Search by company, drive, eligibility or venue..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.driveCount}>
            {filteredDrives.length}{" "}
            {filteredDrives.length === 1
              ? "Placement Drive"
              : "Placement Drives"}
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            <p>Loading placement drives...</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <h2>Unable to Load Placement Drives</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={styles.clearButton}
            >
              Retry
            </button>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              <Briefcase size={32} />
            </div>

            <h2>
              {search ? "No Placement Drives Found" : "No Active Placement Drives"}
            </h2>

            <p>
              {search
                ? "Try another company name, drive title or eligibility criteria."
                : "There are currently no upcoming or open placement drives."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                style={styles.clearButton}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={styles.driveGrid}>
            {filteredDrives.map((drive) => (
              <article key={drive.id} style={styles.driveCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.companySection}>
                    <div style={styles.companyIcon}>
                      <Building2 size={24} />
                    </div>

                    <div>
                      <h2 style={styles.companyName}>{drive.company}</h2>
                      <p style={styles.driveTitle}>{drive.title}</p>
                    </div>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      ...getStatusStyle(drive.status),
                    }}
                  >
                    {drive.status}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <InfoItem
                    icon={<Calendar size={18} color="#2563eb" />}
                    label="Drive Date"
                    value={drive.date || "Not specified"}
                  />

                  <InfoItem
                    icon={<Clock size={18} color="#2563eb" />}
                    label="Application Deadline"
                    value={drive.deadline || "Not specified"}
                  />

                  <InfoItem
                    icon={<MapPin size={18} color="#2563eb" />}
                    label="Venue"
                    value={drive.venue || "Not specified"}
                  />

                  <InfoItem
                    icon={<Briefcase size={18} color="#2563eb" />}
                    label="Mode"
                    value={drive.mode || "Not specified"}
                  />
                </div>

                <div style={styles.eligibilitySection}>
                  <h3 style={styles.sectionHeading}>Eligibility</h3>
                  <p style={styles.eligibilityText}>
                    {drive.eligibility || "Eligibility criteria not specified."}
                  </p>
                </div>

                <div style={styles.actions}>
                  <Link
                    to={`/student/companies/${encodeURIComponent(drive.company)}`}
                    style={styles.companyButton}
                  >
                    <ExternalLink size={17} />
                    View Company
                  </Link>

                  <Link
                    to={`/student/apply/${encodeURIComponent(drive.company)}`}
                    state={{ driveId: drive.id }}
                    style={styles.applyButton}
                  >
                    Apply Now
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={styles.infoItem}>
      {icon}
      <div>
        <span style={styles.infoLabel}>{label}</span>
        <strong style={styles.infoValue}>{value}</strong>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    color: "#0f172a",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    padding: "30px 6%",
  },
  headerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  titleRow: { display: "flex", alignItems: "center", gap: "10px" },
  title: { margin: 0, fontSize: "28px", fontWeight: 700 },
  subtitle: { margin: "8px 0 0 38px", color: "#64748b", fontSize: "14px" },
  dashboardButton: {
    textDecoration: "none",
    color: "#2563eb",
    border: "1px solid #2563eb",
    background: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "35px 30px 60px" },
  searchSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "25px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    padding: "0 15px",
    flex: "1",
    minWidth: "250px",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "14px 0",
    fontSize: "14px",
    background: "transparent",
  },
  driveCount: { color: "#64748b", fontSize: "14px", fontWeight: 600 },
  driveGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "22px",
  },
  driveCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "24px",
    minWidth: 0,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
  },
  companySection: { display: "flex", alignItems: "center", gap: "12px", minWidth: 0 },
  companyIcon: {
    width: "48px",
    height: "48px",
    display: "grid",
    placeItems: "center",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "10px",
    flexShrink: 0,
  },
  companyName: { margin: 0, fontSize: "16px", color: "#1e293b" },
  driveTitle: { margin: "6px 0 0", color: "#64748b", fontSize: "13px" },
  statusBadge: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginTop: "25px",
  },
  infoItem: { display: "flex", alignItems: "flex-start", gap: "10px" },
  infoLabel: { display: "block", color: "#64748b", fontSize: "11px", marginBottom: "5px" },
  infoValue: { display: "block", color: "#334155", fontSize: "13px", overflowWrap: "anywhere" },
  eligibilitySection: {
    marginTop: "25px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "9px",
  },
  sectionHeading: { margin: "0 0 8px", fontSize: "13px", color: "#334155" },
  eligibilityText: { margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.6 },
  actions: { display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" },
  companyButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    flex: "1",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#334155",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 600,
  },
  applyButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    flex: "1",
    padding: "11px 12px",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: 600,
  },
  emptyState: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "60px 20px",
    textAlign: "center",
    color: "#64748b",
  },
  emptyIcon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 18px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#eff6ff",
    color: "#2563eb",
  },
  clearButton: {
    marginTop: "10px",
    padding: "10px 16px",
    background: "#2563eb",
    border: "none",
    borderRadius: "7px",
    color: "#fff",
    cursor: "pointer",
  },
  errorBox: {
    padding: "25px",
    borderRadius: "10px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
  },
};

export default PlacementDrives;
