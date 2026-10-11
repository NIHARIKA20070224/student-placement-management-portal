
const express = require("express");
const db = require("../db");
const authenticateToken = require("./authMiddleware");

const router = express.Router();

// Create an in-app notification
function createNotification(userId, title, message, type = "general") {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [userId, title, message, type], (err, result) => {
      if (err) {
        console.error("Notification creation error:", err);
        return reject(err);
      }

      resolve(result);
    });
  });
}

// Test protected student route
router.get("/test", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Student authentication is working!",
    user: req.user,
  });
});

// Get logged-in student's profile
router.get("/profile", authenticateToken, (req, res) => {
  const studentId = req.user.id;

  const sql = `
    SELECT
      id, full_name, roll_number, email, phone,
      branch, cgpa, role, created_at
    FROM users
    WHERE id = ? AND role = 'student'
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching student profile:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch student profile",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.json({
      success: true,
      student: results[0],
    });
  });
});

// Temporary POST test route
router.post("/applications-test", (req, res) => {
  res.json({
    success: true,
    message: "POST application route is working!",
  });
});

// Submit a placement application
router.post("/applications", authenticateToken, (req, res) => {
  const studentId = req.user.id;

  const {
    driveId,
    fullName,
    rollNumber,
    email,
    phone,
    branch,
    cgpa,
    skills,
    message,
    resumeName,
  } = req.body;

  if (
    !fullName ||
    !rollNumber ||
    !email ||
    !phone ||
    !branch ||
    cgpa === undefined ||
    cgpa === null ||
    cgpa === "" ||
    !skills ||
    !resumeName
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required application details.",
    });
  }

  const parsedCgpa = Number(cgpa);

  if (!Number.isFinite(parsedCgpa)) {
    return res.status(400).json({
      success: false,
      message: "CGPA must be a valid number.",
    });
  }

  const sql = `
    INSERT INTO applications (
      student_id,
      drive_id,
      full_name,
      roll_number,
      email,
      phone,
      branch,
      cgpa,
      skills,
      message,
      resume_name,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Applied')
  `;

  const values = [
    studentId,
    driveId || null,
    fullName,
    rollNumber,
    email,
    phone,
    branch,
    parsedCgpa,
    skills,
    message || "",
    resumeName,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error submitting application:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to submit application",
      });
    }

    const applicationId = result.insertId;

    // Notify the student after the application is saved
    createNotification(
      studentId,
      "Application Submitted",
      `Your application for ${
        driveId
          ? "placement drive #" + driveId
          : "a placement opportunity"
      } has been submitted successfully.`,
      "application"
    ).catch((notificationErr) => {
      console.error("Could not notify student:", notificationErr);
    });

    // Notify all placement officers and admins
    db.query(
      `SELECT id FROM users WHERE role IN ('officer', 'admin')`,
      (officerErr, officers) => {
        if (officerErr) {
          console.error("Could not find officers:", officerErr);
          return;
        }

        const officerMessage =
          `${fullName} (${rollNumber}) has submitted application #${applicationId}.`;

        officers.forEach((officer) => {
          createNotification(
            officer.id,
            "New Student Application",
            officerMessage,
            "application"
          ).catch((notificationErr) => {
            console.error(
              `Could not notify officer ${officer.id}:`,
              notificationErr
            );
          });
        });
      }
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      applicationId,
    });
  });
});

// Get applications submitted by the logged-in student
router.get("/applications", authenticateToken, (req, res) => {
  const studentId = req.user.id;

  const sql = `
    SELECT *
    FROM applications
    WHERE student_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error("Error fetching applications:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
      });
    }

    return res.json({
      success: true,
      applications: results,
    });
  });
});

module.exports = router;
