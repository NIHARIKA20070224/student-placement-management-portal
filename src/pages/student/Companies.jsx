
import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  IndianRupee,
  MapPin,
  Search,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/companies";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCompanies() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Server error: ${response.status}`
        );
      }

      // Support common API response formats.
      const records = Array.isArray(data)
        ? data
        : Array.isArray(data.companies)
          ? data.companies
          : Array.isArray(data.data)
            ? data.data
            : null;

      if (!records) {
        throw new Error(
          data.message ||
            "The companies API did not return a list of companies."
        );
      }

      setCompanies(records);
    } catch (err) {
      console.error("Companies loading error:", err);
      setError(
        err.message ||
          "Unable to load companies. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  // Group records by company name, preserving different job roles.
  const groupedCompanies = useMemo(() => {
    const groups = new Map();

    companies.forEach((company, index) => {
      const name = String(
        company.name || company.company_name || company.companyName || ""
      ).trim();

      if (!name) return;

      const key = name.toLowerCase();

      if (!groups.has(key)) {
        groups.set(key, {
          name,
          records: [],
          roles: [],
        });
      }

      const group = groups.get(key);
      group.records.push(company);

      const roleKey = [
        String(company.role || company.job_role || company.title || "")
          .trim()
          .toLowerCase(),
        String(company.package || company.salary_package || "")
          .trim()
          .toLowerCase(),
        String(company.location || company.location_name || "")
          .trim()
          .toLowerCase(),
      ].join("|");

      const alreadyExists = group.roles.some(
        (role) => role.roleKey === roleKey
      );

      if (!alreadyExists) {
        group.roles.push({
          ...company,
          roleKey,
          displayId: company.id ?? company.company_id ?? `${key}-${index}`,
        });
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [companies]);

  const filteredCompanies = groupedCompanies.filter((company) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      company.name.toLowerCase().includes(query) ||
      company.roles.some((role) => {
        const jobRole = role.role || role.job_role || role.title || "";
        const location = role.location || role.location_name || "";
        const skills = role.skills || role.required_skills || "";

        return (
          String(jobRole).toLowerCase().includes(query) ||
          String(location).toLowerCase().includes(query) ||
          String(skills).toLowerCase().includes(query)
        );
      })
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        fontFamily: "Arial, sans-serif",
        padding: "32px",
        color: "#0f172a",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 8px", fontSize: "30px" }}>
            Available Companies
          </h1>

          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Explore companies and their different job roles.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div
            style={{
              position: "relative",
              width: "280px",
              maxWidth: "100%",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
              }}
            />

            <input
              type="text"
              placeholder="Search companies or roles..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px 11px 40px",
                border: "1px solid #dbe3ef",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
                background: "white",
              }}
            />
          </div>

          <button
            type="button"
            onClick={loadCompanies}
            title="Refresh companies"
            aria-label="Refresh companies"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
              border: "1px solid #dbe3ef",
              borderRadius: "8px",
              background: "white",
              color: "#2563eb",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <p style={{ color: "#64748b" }}>Loading companies...</p>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div
          role="alert"
          style={{
            padding: "18px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            marginBottom: "20px",
          }}
        >
          <p style={{ margin: "0 0 12px" }}>{error}</p>

          <button
            type="button"
            onClick={loadCompanies}
            style={{
              padding: "9px 14px",
              border: "none",
              borderRadius: "6px",
              background: "#b91c1c",
              color: "white",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* COMPANY LIST */}
      {!loading && !error && (
        <>
          <p
            style={{
              color: "#64748b",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            Showing <strong>{filteredCompanies.length}</strong> unique
            companies
          </p>

          {filteredCompanies.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "45px 20px",
                textAlign: "center",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              <Building2 size={38} color="#94a3b8" />

              <h2>No companies found</h2>

              <p style={{ color: "#64748b" }}>
                {companies.length === 0
                  ? "No companies are available yet."
                  : "Try a different company name or job role."}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
                alignItems: "start",
              }}
            >
              {filteredCompanies.map((company) => (
                <article
                  key={company.name.toLowerCase()}
                  style={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      color: "#2563eb",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 700,
                      fontSize: "18px",
                      marginBottom: "14px",
                    }}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </div>

                  <h2 style={{ margin: "0 0 5px", fontSize: "20px" }}>
                    {company.name}
                  </h2>

                  <p
                    style={{
                      margin: "0 0 18px",
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    {company.roles.length}{" "}
                    {company.roles.length === 1 ? "job role" : "job roles"}
                  </p>

                  <div style={{ display: "grid", gap: "12px" }}>
                    {company.roles.map((role) => {
                      const jobRole =
                        role.role || role.job_role || role.title;

                      const jobPackage =
                        role.package || role.salary_package;

                      const location =
                        role.location || role.location_name;

                      const skills =
                        role.skills || role.required_skills;

                      const eligibility =
                        role.eligibility || role.eligibility_criteria;

                      return (
                        <div
                          key={role.displayId}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: "9px",
                            padding: "13px",
                            background: "#fff",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "flex-start",
                            }}
                          >
                            <Briefcase
                              size={16}
                              color="#2563eb"
                              style={{ flexShrink: 0, marginTop: "2px" }}
                            />

                            <strong
                              style={{ fontSize: "14px", lineHeight: 1.4 }}
                            >
                              {jobRole || "Job role not specified"}
                            </strong>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gap: "8px",
                              marginTop: "12px",
                              color: "#64748b",
                              fontSize: "12px",
                            }}
                          >
                            <span
                              style={{
                                display: "flex",
                                gap: "7px",
                                alignItems: "center",
                              }}
                            >
                              <IndianRupee size={14} />
                              {jobPackage || "Package not specified"}
                            </span>

                            <span
                              style={{
                                display: "flex",
                                gap: "7px",
                                alignItems: "center",
                              }}
                            >
                              <MapPin size={14} />
                              {location || "Location not specified"}
                            </span>
                          </div>

                          {eligibility && (
                            <p
                              style={{
                                margin: "12px 0 0",
                                padding: "8px",
                                background: "#f8fafc",
                                borderRadius: "6px",
                                color: "#475569",
                                fontSize: "11px",
                              }}
                            >
                              <strong>Eligibility:</strong> {eligibility}
                            </p>
                          )}

                          {skills && (
                            <p
                              style={{
                                margin: "8px 0 0",
                                padding: "8px",
                                background: "#f8fafc",
                                borderRadius: "6px",
                                color: "#475569",
                                fontSize: "11px",
                              }}
                            >
                              <strong>Skills:</strong> {skills}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Link
                    to={`/student/companies/${encodeURIComponent(company.name)}`}
                    style={{
                      display: "block",
                      boxSizing: "border-box",
                      marginTop: "16px",
                      padding: "11px",
                      borderRadius: "7px",
                      background: "#2563eb",
                      color: "white",
                      textAlign: "center",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    View Placement Drives
                  </Link>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Companies;
