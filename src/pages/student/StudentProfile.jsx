import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Hash,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f8fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
          color: "#64748b",
        }}
      >
        Loading profile...
      </div>
    );
  }

  if (!student) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f6f8fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "35px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#1e293b" }}>
            Unable to load profile
          </h2>

          <p style={{ color: "#64748b" }}>
            Please login again and try again.
          </p>

          <Link
            to="/login"
            style={{
              display: "inline-block",
              marginTop: "10px",
              background: "#2563eb",
              color: "white",
              textDecoration: "none",
              padding: "10px 18px",
              borderRadius: "7px",
              fontSize: "14px",
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
            icon={<span>▦</span>}
            text="Dashboard"
          />

          <SidebarLink
            to="/student/companies"
            icon={<span>▣</span>}
            text="Companies"
          />

          <SidebarLink
            to="/student/drives"
            icon={<span>◷</span>}
            text="Placement Drives"
          />

          <SidebarLink
            to="/student/applications"
            icon={<span>▤</span>}
            text="My Applications"
          />

          <SidebarLink
            to="/student/profile"
            icon={<User size={18} />}
            text="My Profile"
            active
          />

          <SidebarLink
            to="/student"
            icon={<span>●</span>}
            text="Notifications"
          />

          <SidebarLink
            to="/login"
            icon={<span>↪</span>}
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
            marginBottom: "30px",
          }}
        >
          <Link
            to="/student"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "#64748b",
              textDecoration: "none",
              fontSize: "13px",
              marginBottom: "18px",
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "28px",
            }}
          >
            My Profile
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            View your registered student information.
          </p>
        </div>

        {/* Profile Header Card */}
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "30px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "75px",
                height: "75px",
                borderRadius: "50%",
                background: "#eff6ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              {student.full_name
                ? student.full_name.charAt(0).toUpperCase()
                : "S"}
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "23px",
                }}
              >
                {student.full_name}
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {student.email}
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  background: "#ecfdf5",
                  color: "#059669",
                  fontSize: "11px",
                  fontWeight: "600",
                }}
              >
                Student Account
              </span>
            </div>
          </div>
        </section>

        {/* Information */}
        <section
          style={{
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "25px",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              color: "#1e293b",
              fontSize: "19px",
            }}
          >
            Personal & Academic Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "18px",
            }}
          >
            <ProfileItem
              icon={<User size={19} />}
              label="Full Name"
              value={student.full_name}
            />

            <ProfileItem
              icon={<Hash size={19} />}
              label="Roll Number"
              value={student.roll_number || "Not provided"}
            />

            <ProfileItem
              icon={<Mail size={19} />}
              label="Email Address"
              value={student.email}
            />

            <ProfileItem
              icon={<Phone size={19} />}
              label="Phone Number"
              value={student.phone || "Not provided"}
            />

            <ProfileItem
              icon={<GraduationCap size={19} />}
              label="Branch"
              value={student.branch || "Not provided"}
            />

            <ProfileItem
              icon={<GraduationCap size={19} />}
              label="CGPA"
              value={student.cgpa || "Not provided"}
            />

            <ProfileItem
              icon={<ShieldCheck size={19} />}
              label="Account Role"
              value={student.role}
            />
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

function ProfileItem({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "18px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
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
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "11px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.4px",
          }}
        >
          {label}
        </p>

        <p
          style={{
            margin: "5px 0 0",
            color: "#1e293b",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default StudentProfile;