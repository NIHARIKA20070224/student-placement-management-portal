import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed.");
        return;
      }

      // Save login information
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");

      // Redirect based on user role
      if (data.user.role === "officer") {
        navigate("/officer");
      } else {
        navigate("/student");
      }
    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <section className="login-visual">

        <div className="login-brand">

          <div className="login-brand-icon">
            CC
          </div>

          <span>CareerConnect</span>

        </div>

        <div className="login-visual-content">

          <span className="login-tag">
            STUDENT PLACEMENT PORTAL
          </span>

          <h1>
            Your career
            <br />
            starts
            <br />
            <span>here.</span>
          </h1>

          <p>
            Discover placement opportunities, connect with
            companies and manage your entire placement journey
            from one place.
          </p>

          <div className="login-stats">

            <div>
              <strong>01</strong>
              <span>Explore Companies</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Apply for Drives</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Track Applications</span>
            </div>

          </div>

        </div>

        <div className="login-visual-footer">

          <span>Student Placement Portal</span>

          <span>•</span>

          <span>CareerConnect</span>

        </div>

      </section>


      {/* RIGHT SIDE */}

      <section className="login-form-section">

        <div className="login-form-container">

          <div className="login-mobile-brand">

            <div className="login-brand-icon">
              CC
            </div>

            <span>CareerConnect</span>

          </div>


          <div className="login-heading">

            <span className="login-small-title">
              WELCOME BACK
            </span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials to continue to CareerConnect.
            </p>

          </div>


          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="login-field">

              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

            </div>


            <div className="login-field">

              <label htmlFor="login-password">
                Password
              </label>

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

            </div>


            <div className="login-options">

              <label className="remember-me">

                <input type="checkbox" />

                <span>Remember me</span>

              </label>

              <span className="forgot-password">
                Forgot password?
              </span>

            </div>


            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >

              {loading
                ? "Signing In..."
                : "Sign In"}

            </button>

          </form>


          <div className="login-register">

            <span>Don't have an account?</span>

            <Link to="/register">
              Create account
            </Link>

          </div>


          <div className="login-security">

            <span className="security-icon">
              ✓
            </span>

            <span>
              Your account information is securely protected.
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;