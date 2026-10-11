
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  IndianRupee,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/companies";

const EMPTY_FORM = {
  name: "",
  role: "",
  package: "",
  location: "",
  eligibility: "",
  skills: "",
};

function ManageCompanies() {
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const getToken = () => localStorage.getItem("token");

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load companies.");
      }

      setCompanies(Array.isArray(data.companies) ? data.companies : []);
    } catch (err) {
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

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
    setNotice("");

    if (!formData.name.trim() || !formData.role.trim()) {
      setError("Company name and job role are required.");
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your login token is missing. Please log in again as an officer.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      package: formData.package.trim(),
      location: formData.location.trim(),
      eligibility: formData.eligibility.trim(),
      skills: formData.skills.trim(),
    };

    setSaving(true);

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Could not save the company."
        );
      }

      await loadCompanies();
      resetForm();
      setNotice(
        editingId
          ? "Company updated successfully."
          : "Company added to the database successfully."
      );
    } catch (err) {
      setError(err.message || "Failed to save company.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (company) => {
    setFormData({
      name: company.name || "",
      role: company.role || "",
      package: company.package || "",
      location: company.location || "",
      eligibility: company.eligibility || "",
      skills: company.skills || "",
    });

    setEditingId(company.id);
    setShowForm(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (company) => {
    const confirmed = window.confirm(
      `Delete ${company.name}? This may be blocked if placement drives refer to this company.`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setError("Your login token is missing. Please log in again.");
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${company.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete company.");
      }

      await loadCompanies();
      setNotice("Company deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete company.");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "32px",
      boxSizing: "border-box",
      background: "#f6f8fb",
      fontFamily: "Arial, sans-serif",
      color: "#0f172a",
    },
    container: {
      maxWidth: "1250px",
      margin: "0 auto",
    },
    panel: {
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "22px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "11px 12px",
      border: "1px solid #cbd5e1",
      borderRadius: "7px",
      fontSize: "13px",
      outline: "none",
    },
    label: {
      display: "block",
      marginBottom: "7px",
      color: "#334155",
      fontSize: "12px",
      fontWeight: 600,
    },
    primaryButton: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      padding: "11px 16px",
      border: "none",
      borderRadius: "7px",
      background: "#2563eb",
      color: "white",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "13px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "25px",
          }}
        >
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <Link
              to="/officer"
              aria-label="Back to dashboard"
              style={{
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                background: "white",
                color: "#334155",
                textDecoration: "none",
              }}
            >
              <ArrowLeft size={18} />
            </Link>

            <div>
              <p
                style={{
                  margin: "0 0 5px",
                  color: "#2563eb",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                }}
              >
                PLACEMENT OFFICER PORTAL
              </p>
              <h1 style={{ margin: 0, fontSize: "27px" }}>
                Manage Companies
              </h1>
              <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: "13px" }}>
                Companies are loaded from your MySQL database.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={loadCompanies}
              style={{
                ...styles.primaryButton,
                background: "white",
                color: "#334155",
                border: "1px solid #cbd5e1",
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setError("");
                  setNotice("");
                  setFormData(EMPTY_FORM);
                  setEditingId(null);
                  setShowForm(true);
                }
              }}
              style={styles.primaryButton}
            >
              {showForm ? <X size={17} /> : <Plus size={17} />}
              {showForm ? "Cancel" : "Add Company"}
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              ...styles.panel,
              color: "#b91c1c",
              background: "#fef2f2",
              borderColor: "#fecaca",
              padding: "14px 18px",
            }}
          >
            <strong>Action failed:</strong> {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              ...styles.panel,
              color: "#166534",
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
              padding: "14px 18px",
            }}
          >
            {notice}
          </div>
        )}

        {showForm && (
          <section style={styles.panel}>
            <h2 style={{ margin: "0 0 20px", fontSize: "19px" }}>
              {editingId ? "Edit Company" : "Add New Company"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "18px",
                }}
              >
                {[
                  ["name", "Company Name", "Example: Amazon"],
                  ["role", "Job Role", "Example: Software Engineer"],
                  ["package", "Package", "Example: 18 LPA"],
                  ["location", "Location", "Example: Hyderabad"],
                  ["eligibility", "Eligibility", "Example: 7.0 CGPA"],
                  ["skills", "Required Skills", "Example: Java, SQL, React"],
                ].map(([name, label, placeholder]) => (
                  <div key={name}>
                    <label htmlFor={name} style={styles.label}>
                      {label}
                    </label>
                    <input
                      id={name}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={placeholder}
                      required={name === "name" || name === "role"}
                      style={styles.input}
                    />
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "22px",
                }}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  style={{
                    padding: "11px 16px",
                    background: "white",
                    border: "1px solid #cbd5e1",
                    borderRadius: "7px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...styles.primaryButton,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save Changes"
                    : "Save Company"}
                </button>
              </div>
            </form>
          </section>
        )}

        <div style={{ marginBottom: "16px", color: "#64748b", fontSize: "13px" }}>
          Total companies: <strong>{companies.length}</strong>
        </div>

        {loading ? (
          <section style={{ ...styles.panel, textAlign: "center", padding: "50px" }}>
            Loading companies from the database...
          </section>
        ) : companies.length === 0 ? (
          <section style={{ ...styles.panel, textAlign: "center", padding: "55px 20px" }}>
            <Building2 size={42} color="#94a3b8" />
            <h2>No companies found</h2>
            <p style={{ color: "#64748b" }}>
              Click Add Company to save the first company to MySQL.
            </p>
          </section>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {companies.map((company) => (
              <article key={company.id} style={styles.panel}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#eff6ff",
                      color: "#2563eb",
                      borderRadius: "10px",
                    }}
                  >
                    <Building2 size={22} />
                  </div>

                  <div style={{ display: "flex", gap: "7px" }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(company)}
                      title="Edit company"
                      style={{
                        border: "1px solid #dbeafe",
                        background: "#eff6ff",
                        color: "#2563eb",
                        borderRadius: "7px",
                        width: "35px",
                        cursor: "pointer",
                      }}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(company)}
                      title="Delete company"
                      style={{
                        border: "1px solid #fee2e2",
                        background: "#fef2f2",
                        color: "#dc2626",
                        borderRadius: "7px",
                        width: "35px",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h2 style={{ margin: "16px 0 6px", fontSize: "19px" }}>
                  {company.name}
                </h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
                  {company.role}
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: "13px",
                    marginTop: "20px",
                    paddingTop: "17px",
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <Detail
                    icon={<IndianRupee size={15} />}
                    label="Package"
                    value={company.package}
                  />
                  <Detail
                    icon={<MapPin size={15} />}
                    label="Location"
                    value={company.location}
                  />
                  <Detail
                    icon={<Briefcase size={15} />}
                    label="Eligibility"
                    value={company.eligibility}
                  />
                  {company.skills && (
                    <Detail
                      icon={<Briefcase size={15} />}
                      label="Skills"
                      value={company.skills}
                    />
                  )}
                  <small style={{ color: "#94a3b8" }}>
                    Database ID: {company.id}
                  </small>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
      <span style={{ color: "#2563eb", display: "flex" }}>{icon}</span>
      <div>
        <div style={{ color: "#94a3b8", fontSize: "10px", marginBottom: "4px" }}>
          {label}
        </div>
        <div style={{ color: "#334155", fontSize: "12px" }}>
          {value || "Not specified"}
        </div>
      </div>
    </div>
  );
}

export default ManageCompanies;
