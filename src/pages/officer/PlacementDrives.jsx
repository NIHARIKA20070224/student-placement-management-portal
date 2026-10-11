
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  BriefcaseBusiness,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  company_id: "",
  title: "",
  date: "",
  deadline: "",
  venue: "",
  mode: "Offline",
  eligibility: "",
  status: "Upcoming",
};

function getDateValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
}

function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedCompanyName, setSelectedCompanyName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token = localStorage.getItem("token");

  // Show each company name only once in the first dropdown.
  const uniqueCompanyNames = useMemo(() => {
    const names = companies
      .map((company) => String(company.name || "").trim())
      .filter(Boolean);

    return [...new Set(names)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [companies]);

  // Get all role records belonging to the selected company.
  const rolesForSelectedCompany = useMemo(() => {
    return companies.filter(
      (company) =>
        String(company.name || "").trim().toLowerCase() ===
        selectedCompanyName.trim().toLowerCase()
    );
  }, [companies, selectedCompanyName]);

  const selectedRole = rolesForSelectedCompany.find(
    (role) => String(role.id) === String(formData.company_id)
  );

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new Error(
        data.message || `Request failed (${response.status})`
      );
    }

    return data;
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [driveData, companyData] = await Promise.all([
        apiRequest("/drives"),
        apiRequest("/companies"),
      ]);

      setDrives(
        (driveData.drives || []).map((drive) => ({
          ...drive,
          id: Number(drive.id),
          company_id: Number(drive.company_id),
          company: drive.company || "",
          date: getDateValue(drive.date || drive.drive_date),
          deadline: getDateValue(drive.deadline),
        }))
      );

      setCompanies(companyData.companies || []);
    } catch (err) {
      setError(err.message || "Unable to load placement drives.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleCompanyChange(event) {
    const name = event.target.value;

    setSelectedCompanyName(name);

    // A role must be selected again when the company changes.
    setFormData((previous) => ({
      ...previous,
      company_id: "",
      title: "",
      eligibility: "",
    }));
  }

  function handleRoleChange(event) {
    const roleId = event.target.value;

    const role = rolesForSelectedCompany.find(
      (item) => String(item.id) === String(roleId)
    );

    setFormData((previous) => ({
      ...previous,
      company_id: roleId,
      title: role?.role || "",
      eligibility: role?.eligibility || "",
    }));
  }

  function resetForm() {
    setFormData(emptyForm);
    setSelectedCompanyName("");
    setEditingId(null);
    setShowForm(false);
  }

  function handleCreate() {
    setError("");
    setNotice("");
    setEditingId(null);
    setFormData(emptyForm);
    setSelectedCompanyName("");
    setShowForm(true);
  }

  function handleEdit(drive) {
    setError("");
    setNotice("");

    const matchedCompany = companies.find(
      (company) => String(company.id) === String(drive.company_id)
    );

    setSelectedCompanyName(matchedCompany?.name || drive.company || "");

    setFormData({
      company_id: String(drive.company_id),
      title: drive.title || "",
      date: drive.date || "",
      deadline: drive.deadline || "",
      venue: drive.venue || "",
      mode: drive.mode || "Offline",
      eligibility: drive.eligibility || "",
      status: drive.status || "Upcoming",
    });

    setEditingId(drive.id);
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!token) {
      setError("Please log in before managing placement drives.");
      return;
    }

    if (!selectedCompanyName) {
      setError("Please select a company.");
      return;
    }

    if (!formData.company_id || !selectedRole) {
      setError("Please select a role for the selected company.");
      return;
    }

    if (!formData.title.trim() || !formData.date) {
      setError("Drive title and drive date are required.");
      return;
    }

    if (
      formData.deadline &&
      formData.deadline > formData.date
    ) {
      setError("The application deadline cannot be after the drive date.");
      return;
    }

    const payload = {
      // This is the ID of the selected company-role record.
      // placement_drives.company_id references companies.id.
      company_id: Number(formData.company_id),
      title: formData.title.trim(),
      date: formData.date,
      deadline: formData.deadline || null,
      venue: formData.venue.trim() || null,
      mode: formData.mode,
      eligibility: formData.eligibility.trim() || null,
      status: formData.status,
    };

    setSaving(true);

    try {
      if (editingId !== null) {
        await apiRequest(`/drives/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setNotice("Placement drive updated successfully.");
      } else {
        await apiRequest("/drives", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setNotice("Placement drive created successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Unable to save placement drive.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this placement drive?"
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/drives/${id}`, {
        method: "DELETE",
      });

      setDrives((previous) =>
        previous.filter((drive) => drive.id !== id)
      );

      setNotice("Placement drive deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete placement drive.");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.heading}>Placement Drives</h1>
          <p style={styles.subtitle}>
            Create and manage placement drives.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            style={styles.secondaryButton}
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleCreate}
            style={styles.primaryButton}
          >
            <Plus size={18} /> Create Drive
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {notice && <div style={styles.success}>{notice}</div>}

      {showForm && (
        <section style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formHeading}>
              {editingId !== null
                ? "Edit Placement Drive"
                : "Create Placement Drive"}
            </h2>

            <button
              type="button"
              onClick={resetForm}
              style={styles.iconButton}
              aria-label="Close form"
            >
              <X size={20} />
            </button>
          </div>

          {companies.length === 0 ? (
            <p style={styles.muted}>
              No companies are available. Add a company before
              creating a placement drive.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <label style={styles.label}>
                  Company Name
                  <select
                    value={selectedCompanyName}
                    onChange={handleCompanyChange}
                    required
                    style={styles.input}
                  >
                    <option value="">Select a company</option>

                    {uniqueCompanyNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={styles.label}>
                  Job Role
                  <select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleRoleChange}
                    required
                    disabled={!selectedCompanyName}
                    style={styles.input}
                  >
                    <option value="">
                      {selectedCompanyName
                        ? "Select a role"
                        : "Select a company first"}
                    </option>

                    {rolesForSelectedCompany.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role || "Role not specified"}
                        {role.package ? ` — ${role.package}` : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={styles.label}>
                  Drive Title
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter placement drive title"
                    required
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Drive Date
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Application Deadline
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    max={formData.date || undefined}
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Venue
                  <input
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    placeholder="College auditorium or online"
                    style={styles.input}
                  />
                </label>

                <label style={styles.label}>
                  Mode
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="Offline">Offline</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </label>

                <label style={styles.label}>
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Open">Open</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </label>

                <label
                  style={{
                    ...styles.label,
                    gridColumn: "1 / -1",
                  }}
                >
                  Eligibility Criteria
                  <textarea
                    name="eligibility"
                    value={formData.eligibility}
                    onChange={handleChange}
                    placeholder="CGPA, eligible branches, skills, etc."
                    rows={3}
                    style={{
                      ...styles.input,
                      resize: "vertical",
                    }}
                  />
                </label>
              </div>

              {selectedRole && (
                <div style={styles.roleHint}>
                  <BriefcaseBusiness size={16} />
                  <span>
                    Selected role: <strong>{selectedRole.role}</strong>
                    {selectedRole.package
                      ? ` — ${selectedRole.package}`
                      : ""}
                  </span>
                </div>
              )}

              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  style={styles.secondaryButton}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || loading}
                  style={styles.primaryButton}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                    ? "Update Drive"
                    : "Create Drive"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {loading ? (
        <div style={styles.emptyCard}>Loading placement drives...</div>
      ) : drives.length === 0 ? (
        <div style={styles.emptyCard}>
          <Calendar size={44} color="#94a3b8" />
          <h3>No Placement Drives</h3>
          <p>
            Create a placement drive to make it available to students.
          </p>
        </div>
      ) : (
        <div style={styles.driveGrid}>
          {drives.map((drive) => (
            <article key={drive.id} style={styles.driveCard}>
              <div style={styles.cardHeader}>
                <div>
                  <p style={styles.companyName}>{drive.company}</p>
                  <h2 style={styles.driveTitle}>{drive.title}</h2>
                </div>

                <span style={styles.statusBadge}>
                  {drive.status || "Upcoming"}
                </span>
              </div>

              <div style={styles.details}>
                <p>
                  <Calendar size={16} />
                  Drive date: {drive.date || "Not specified"}
                </p>
                <p>
                  <Calendar size={16} />
                  Deadline: {drive.deadline || "Not specified"}
                </p>
                <p>
                  <MapPin size={16} />
                  {drive.venue || "Venue not specified"} ({drive.mode || "Offline"})
                </p>
              </div>

              <div style={styles.eligibility}>
                <strong>Eligibility</strong>
                <p>{drive.eligibility || "Not specified"}</p>
              </div>

              <div style={styles.cardActions}>
                <button
                  type="button"
                  onClick={() => handleEdit(drive)}
                  style={styles.secondaryButton}
                >
                  <Pencil size={15} /> Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(drive.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f8fb",
    fontFamily: "Arial, sans-serif",
    padding: "30px 40px",
    color: "#0f172a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "30px",
  },
  heading: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },
  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "14px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    padding: "11px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
    padding: "10px 14px",
    borderRadius: "7px",
    cursor: "pointer",
  },
  deleteButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    background: "#fef2f2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "7px",
    cursor: "pointer",
  },
  formCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "30px",
  },
  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  formHeading: {
    margin: 0,
    fontSize: "20px",
    color: "#1e293b",
  },
  iconButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#64748b",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    outline: "none",
    fontSize: "13px",
    color: "#334155",
    background: "white",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "25px",
  },
  roleHint: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: "18px",
    padding: "12px",
    background: "#eff6ff",
    borderRadius: "8px",
    color: "#1d4ed8",
    fontSize: "13px",
  },
  emptyCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "60px 20px",
    textAlign: "center",
    color: "#64748b",
  },
  driveGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  driveCard: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "22px",
    minWidth: 0,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  companyName: {
    margin: 0,
    color: "#2563eb",
    fontSize: "13px",
    fontWeight: 600,
  },
  driveTitle: {
    margin: "6px 0 0",
    color: "#1e293b",
    fontSize: "18px",
  },
  statusBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  details: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    color: "#64748b",
    fontSize: "13px",
  },
  eligibility: {
    marginTop: "18px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#334155",
  },
  cardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "13px",
  },
  success: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "18px",
    fontSize: "13px",
  },
  muted: {
    color: "#64748b",
    fontSize: "13px",
  },
};

export default PlacementDrives;
