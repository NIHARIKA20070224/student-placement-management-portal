import { Link } from "react-router-dom";
import {
  GraduationCap,
  Building2,
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

function LandingPage() {
  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <GraduationCap size={25} />
          </div>

          <div>
            <h2 style={styles.logoText}>CareerConnect</h2>
            <p style={styles.logoSubtext}>
              Placement Management Portal
            </p>
          </div>
        </div>

        <div style={styles.navLinks}>
          <a href="#home" style={styles.navLink}>
            Home
          </a>

          <a href="#features" style={styles.navLink}>
            Features
          </a>

          <Link to="/login" style={styles.loginButton}>
            Login
          </Link>

          <Link to="/register" style={styles.registerButton}>
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            <Briefcase size={16} />
            Smart Campus Placement Platform
          </div>

          <h1 style={styles.heading}>
            Connect Students With
            <span style={styles.headingBlue}>
              {" "}
              Career Opportunities
            </span>
          </h1>

          <p style={styles.description}>
            A centralized placement management portal that helps students
            discover opportunities, apply for placement drives, and track
            their applications while enabling placement officers to manage
            companies and recruitment activities efficiently.
          </p>

          <div style={styles.heroButtons}>
            <Link to="/login" style={styles.primaryButton}>
              Get Started
              <ArrowRight size={19} />
            </Link>

            <Link to="/register" style={styles.secondaryButton}>
              Create Account
            </Link>

            <a href="#features" style={styles.secondaryButton}>
              Explore Features
            </a>
          </div>

          <div style={styles.trustRow}>
            <div style={styles.trustItem}>
              <CheckCircle size={18} />
              Easy Application Tracking
            </div>

            <div style={styles.trustItem}>
              <CheckCircle size={18} />
              Placement Drive Management
            </div>

            <div style={styles.trustItem}>
              <CheckCircle size={18} />
              Centralized Portal
            </div>
          </div>
        </div>

        {/* Hero Card */}
        <div style={styles.heroCard}>
          <div style={styles.cardTop}>
            <div>
              <p style={styles.smallText}>PLACEMENT OVERVIEW</p>

              <h3 style={styles.cardHeading}>
                Your Career Journey
              </h3>
            </div>

            <div style={styles.cardIcon}>
              <Briefcase size={23} />
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <Building2 size={23} style={styles.statIcon} />
              <h3 style={styles.statNumber}>12+</h3>
              <p style={styles.statLabel}>Companies</p>
            </div>

            <div style={styles.statBox}>
              <Briefcase size={23} style={styles.statIcon} />
              <h3 style={styles.statNumber}>25+</h3>
              <p style={styles.statLabel}>Opportunities</p>
            </div>

            <div style={styles.statBox}>
              <Users size={23} style={styles.statIcon} />
              <h3 style={styles.statNumber}>500+</h3>
              <p style={styles.statLabel}>Students</p>
            </div>

            <div style={styles.statBox}>
              <GraduationCap size={23} style={styles.statIcon} />
              <h3 style={styles.statNumber}>100+</h3>
              <p style={styles.statLabel}>Selections</p>
            </div>
          </div>

          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span>Placement Process</span>
              <span>Active</span>
            </div>

            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <p style={styles.sectionLabel}>FEATURES</p>

          <h2 style={styles.sectionTitle}>
            Everything You Need for
            <span style={styles.headingBlue}>
              {" "}
              Placements
            </span>
          </h2>

          <p style={styles.sectionDescription}>
            One platform for students and placement officers to manage
            the complete campus recruitment process.
          </p>
        </div>

        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <Building2 size={25} />
            </div>

            <h3>Explore Companies</h3>

            <p>
              View available companies, job roles, packages,
              locations and eligibility criteria.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <Briefcase size={25} />
            </div>

            <h3>Placement Drives</h3>

            <p>
              Discover upcoming placement drives with dates,
              deadlines, venues and eligibility details.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <Users size={25} />
            </div>

            <h3>Track Applications</h3>

            <p>
              Students can apply for opportunities and monitor
              their application status from one place.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>
              <GraduationCap size={25} />
            </div>

            <h3>Officer Management</h3>

            <p>
              Placement officers can manage companies, drives
              and applicants through a centralized dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaHeading}>
          Ready to begin your placement journey?
        </h2>

        <p style={styles.ctaDescription}>
          Explore opportunities and stay updated with your campus placements.
        </p>

        <div style={styles.ctaButtons}>
          <Link to="/login" style={styles.primaryButton}>
            Login
            <ArrowRight size={19} />
          </Link>

          <Link to="/register" style={styles.registerCtaButton}>
            Register
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div>
          <strong>CareerConnect</strong>
          <span> — Placement Management Portal</span>
        </div>

        <p style={styles.footerText}>
          © 2026 CareerConnect. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  navbar: {
    height: "76px",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 7%",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  logo: {
    width: "43px",
    height: "43px",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
  },

  logoSubtext: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  navLink: {
    textDecoration: "none",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 500,
    marginRight: "18px",
  },

  loginButton: {
    textDecoration: "none",
    color: "#2563eb",
    background: "#ffffff",
    border: "1px solid #2563eb",
    padding: "9px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
  },

  registerButton: {
    textDecoration: "none",
    background: "#2563eb",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
  },

  hero: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "85px 30px 80px",
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "70px",
    alignItems: "center",
  },

  heroContent: {
    maxWidth: "680px",
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "8px 13px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "22px",
  },

  heading: {
    fontSize: "52px",
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
    margin: "0 0 22px",
    fontWeight: 750,
  },

  headingBlue: {
    color: "#2563eb",
  },

  description: {
    color: "#64748b",
    fontSize: "17px",
    lineHeight: 1.75,
    margin: "0 0 30px",
    maxWidth: "650px",
  },

  heroButtons: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    background: "#2563eb",
    color: "#ffffff",
    textDecoration: "none",
    padding: "13px 22px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "14px",
  },

  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "#334155",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "12px 21px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "14px",
  },

  trustRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "18px",
  },

  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#64748b",
    fontSize: "12px",
  },

  heroCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "28px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "25px",
  },

  smallText: {
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    margin: "0 0 7px",
  },

  cardHeading: {
    margin: 0,
    fontSize: "21px",
  },

  cardIcon: {
    width: "44px",
    height: "44px",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },

  statBox: {
    border: "1px solid #e2e8f0",
    borderRadius: "11px",
    padding: "17px",
  },

  statIcon: {
    color: "#2563eb",
  },

  statNumber: {
    fontSize: "22px",
    margin: "9px 0 2px",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "12px",
    margin: 0,
  },

  progressSection: {
    marginTop: "25px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#475569",
    marginBottom: "8px",
  },

  progressBar: {
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  progressFill: {
    width: "78%",
    height: "100%",
    background: "#2563eb",
    borderRadius: "10px",
  },

  featuresSection: {
    background: "#ffffff",
    padding: "80px 7%",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },

  sectionHeader: {
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto 45px",
  },

  sectionLabel: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    marginBottom: "10px",
  },

  sectionTitle: {
    fontSize: "34px",
    margin: "0 0 14px",
  },

  sectionDescription: {
    color: "#64748b",
    lineHeight: 1.6,
    margin: 0,
  },

  featureGrid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "18px",
  },

  featureCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
    padding: "24px",
    background: "#ffffff",
  },

  featureIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
  },

  ctaSection: {
    textAlign: "center",
    padding: "75px 20px",
    background: "#f8fafc",
  },

  ctaHeading: {
    fontSize: "30px",
    margin: "0 0 10px",
  },

  ctaDescription: {
    color: "#64748b",
    margin: "0 0 25px",
  },

  ctaButtons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
  },

  registerCtaButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "#2563eb",
    background: "#ffffff",
    border: "1px solid #2563eb",
    padding: "12px 22px",
    borderRadius: "8px",
    fontWeight: 600,
    fontSize: "14px",
  },

  footer: {
    background: "#0f172a",
    color: "#cbd5e1",
    padding: "24px 7%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },

  footerText: {
    margin: 0,
  },
};

export default LandingPage;