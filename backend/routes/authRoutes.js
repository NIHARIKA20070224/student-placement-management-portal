
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../db");

const router = express.Router();

console.log("AUTH ROUTES LOADED");

// Load JWT secret from backend/.env
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing. Please add it to your backend/.env file."
  );
}

// ===============================
// TEST AUTH ROUTE
// ===============================
router.get("/check", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working!",
  });
});

// ===============================
// REGISTER STUDENT
// ===============================
router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      roll_number,
      email,
      phone,
      branch,
      cgpa,
      password,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("Registration lookup failed:", err.message);

          return res.status(500).json({
            success: false,
            message: "Database error while checking registration",
          });
        }

        if (results.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Email already registered",
          });
        }

        try {
          const hashedPassword = await bcrypt.hash(password, 10);

          const sql = `
            INSERT INTO users
            (
              full_name,
              roll_number,
              email,
              phone,
              branch,
              cgpa,
              password,
              role
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'student')
          `;

          db.query(
            sql,
            [
              full_name,
              roll_number || null,
              email,
              phone || null,
              branch || null,
              cgpa === "" || cgpa == null ? null : cgpa,
              hashedPassword,
            ],
            (insertErr, result) => {
              if (insertErr) {
                console.error(
                  "Student registration failed:",
                  insertErr.message
                );

                return res.status(500).json({
                  success: false,
                  message: "Registration failed",
                });
              }

              return res.status(201).json({
                success: true,
                message: "Student registered successfully!",
                userId: result.insertId,
              });
            }
          );
        } catch (hashError) {
          console.error("Password hashing failed:", hashError.message);

          return res.status(500).json({
            success: false,
            message: "Unable to process registration",
          });
        }
      }
    );
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
});

// ===============================
// LOGIN
// ===============================
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error("Login database error:", err.message);

        return res.status(500).json({
          success: false,
          message: "Unable to process login",
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const user = results[0];

      try {
        const passwordMatch = await bcrypt.compare(
          password,
          user.password
        );

        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          JWT_SECRET,
          {
            expiresIn: "1d",
          }
        );

        return res.status(200).json({
          success: true,
          message: "Login successful!",
          token,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            roll_number: user.roll_number,
            phone: user.phone,
            branch: user.branch,
            cgpa: user.cgpa,
            role: user.role,
          },
        });
      } catch (loginError) {
        console.error("Login processing error:", loginError.message);

        return res.status(500).json({
          success: false,
          message: "Unable to complete login",
        });
      }
    }
  );
});

module.exports = router;
