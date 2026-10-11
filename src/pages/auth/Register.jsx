import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    if (
      !fullName.trim() ||
      !rollNumber.trim() ||
      !email.trim() ||
      !branch ||
      !year ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            roll_number: rollNumber,
            email: email,
            branch: branch,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed.");
        return;
      }

      alert("Account created successfully!");

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      alert(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* LEFT SECTION */}

      <section className="login-visual">

        <div className="login-brand">

          <div className="login-brand-icon">
            CC
          </div>

          <span>CareerConnect</span>

        </div>

        <div className="login-visual-content">

          <span className="login-tag">
            START YOUR PLACEMENT JOURNEY
          </span>

          <h1>
            Create your
            <br />
            profile.
            <br />
            <span>Find your opportunity.</span>
          </h1>

          <p>
            Build your student profile, discover companies,
            apply for placement drives and keep track of
            every opportunity in one place.
          </p>

          <div className="registration-benefits">

            <div className="registration-benefit">

              <span className="benefit-number">
                01
              </span>

              <div>
                <strong>
                  Build your profile
                </strong>

                <p>
                  Keep your academic information organized.
                </p>
              </div>

            </div>

            <div className="registration-benefit">

              <span className="benefit-number">
                02
              </span>

              <div>
                <strong>
                  Discover opportunities
                </strong>

                <p>
                  Explore companies and placement drives.
                </p>
              </div>

            </div>

            <div className="registration-benefit">

              <span className="benefit-number">
                03
              </span>

              <div>
                <strong>
                  Track applications
                </strong>

                <p>
                  Follow your placement progress easily.
                </p>
              </div>

            </div>

          </div>

        </div>

        <div className="login-visual-footer">

          <span>Student Placement Portal</span>

          <span>•</span>

          <span>CareerConnect</span>

        </div>

      </section>


      {/* RIGHT SECTION */}

      <section className="login-form-section">

        <div className="register-form-container">

          <div className="login-mobile-brand">

            <div className="login-brand-icon">
              CC
            </div>

            <span>CareerConnect</span>

          </div>


          <div className="login-heading">

            <span className="login-small-title">
              CREATE ACCOUNT
            </span>

            <h2>
              Create your student account
            </h2>

            <p>
              Enter your details to get started with CareerConnect.
            </p>

          </div>


          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            {/* NAME */}

            <div className="register-field">

              <label htmlFor="full-name">
                Full name
              </label>

              <input
                id="full-name"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
              />

            </div>


            {/* ROLL NUMBER */}

            <div className="register-field">

              <label htmlFor="roll-number">
                Roll number
              </label>

              <input
                id="roll-number"
                type="text"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={(event) =>
                  setRollNumber(event.target.value)
                }
              />

            </div>


            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="register-email">
                Email address
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

            </div>


            {/* BRANCH + YEAR */}

            <div className="register-two-columns">

              <div className="register-field">

                <label htmlFor="branch">
                  Branch
                </label>

                <select
                  id="branch"
                  value={branch}
                  onChange={(event) =>
                    setBranch(event.target.value)
                  }
                >

                  <option value="">
                    Select branch
                  </option>

                  <option value="CSE">
                    CSE
                  </option>

                  <option value="ECE">
                    ECE
                  </option>

                  <option value="EEE">
                    EEE
                  </option>

                  <option value="ME">
                    Mechanical
                  </option>

                  <option value="CE">
                    Civil
                  </option>

                </select>

              </div>


              <div className="register-field">

                <label htmlFor="year">
                  Year
                </label>

                <select
                  id="year"
                  value={year}
                  onChange={(event) =>
                    setYear(event.target.value)
                  }
                >

                  <option value="">
                    Select year
                  </option>

                  <option value="1">
                    1st Year
                  </option>

                  <option value="2">
                    2nd Year
                  </option>

                  <option value="3">
                    3rd Year
                  </option>

                  <option value="4">
                    4th Year
                  </option>

                </select>

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-two-columns">

              <div className="register-field">

                <label htmlFor="register-password">
                  Password
                </label>

                <input
                  id="register-password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                />

              </div>


              <div className="register-field">

                <label htmlFor="confirm-password">
                  Confirm password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                />

              </div>

            </div>


            {/* TERMS */}

            <label className="register-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the terms and conditions of the
                placement portal.
              </span>

            </label>


            {/* BUTTON */}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Student Account"}
            </button>

          </form>


          {/* LOGIN LINK */}

          <div className="login-register">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
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

export default Register;