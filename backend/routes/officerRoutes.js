
const express = require("express");
const db = require("../db");
const authenticateToken = require("./authMiddleware");

const router = express.Router();

function requireOfficer(req, res, next) {
  if (!req.user || req.user.role !== "officer") {
    return res.status(403).json({
      success: false,
      message: "Only placement officers can manage applications.",
    });
  }

  next();
}

function createNotification(userId, title, message, type = "general") {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [userId, title, message, type], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

// Get all applications
router.get(
  "/applications",
  authenticateToken,
  requireOfficer,
  (req, res) => {
    db.query(
      "SELECT * FROM applications ORDER BY id DESC",
      (err, results) => {
        if (err) {
          console.error("Error fetching applications:", err);

          return res.status(500).json({
            success: false,
            message: "Failed to fetch applications.",
          });
        }

        res.json({
          success: true,
          applications: results,
        });
      }
    );
  }
);

// Update application status and notify the student
router.patch(
  "/applications/:id/status",
  authenticateToken,
  requireOfficer,
  (req, res) => {
    const applicationId = Number(req.params.id);
    const { status } = req.body || {};

    const allowedStatuses = [
      "Applied",
      "Under Review",
      "Shortlisted",
      "Selected",
      "Rejected",
    ];

    if (!Number.isInteger(applicationId) || applicationId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status.",
      });
    }

    db.query(
      `SELECT id, student_id, full_name, status
       FROM applications
       WHERE id = ?`,
      [applicationId],
      (findErr, rows) => {
        if (findErr) {
          console.error("Error finding application:", findErr);

          return res.status(500).json({
            success: false,
            message: "Failed to find application.",
          });
        }

        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Application not found.",
          });
        }

        const application = rows[0];
        const previousStatus = application.status;

        db.query(
          "UPDATE applications SET status = ? WHERE id = ?",
          [status, applicationId],
          async (updateErr) => {
            if (updateErr) {
              console.error("Error updating status:", updateErr);

              return res.status(500).json({
                success: false,
                message: "Failed to update application status.",
              });
            }

            // Only notify when the status actually changes.
            if (previousStatus !== status) {
              let title = "Application Status Updated";
              let message =
                `Your application #${applicationId} status is now "${status}".`;

              if (status === "Selected") {
                title = "Congratulations! You have been selected";
                message =
                  `Congratulations! Your application #${applicationId} has been marked Selected.`;
              } else if (status === "Rejected") {
                title = "Application Status Updated";
                message =
                  `Your application #${applicationId} has been marked Rejected. Please check your placement portal for details.`;
              }

              try {
                await createNotification(
                  application.student_id,
                  title,
                  message,
                  "application"
                );
              } catch (notificationErr) {
                console.error(
                  "Status updated, but notification creation failed:",
                  notificationErr
                );
              }
            }

            return res.json({
              success: true,
              message: "Application status updated successfully.",
              applicationId,
              status,
            });
          }
        );
      }
    );
  }
);

module.exports = router;
