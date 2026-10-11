
const express = require("express");
const db = require("../db");
const authenticateToken = require("./authMiddleware");

const router = express.Router();

function requireOfficer(req, res, next) {
  if (!req.user || !["officer", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Officer access required",
    });
  }

  next();
}

function validDate(value) {
  return typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

// GET /api/drives
// Return drives with their real MySQL IDs and company names.
router.get("/", (req, res) => {
  const sql = `
    SELECT
      d.id,
      d.company_id,
      c.name AS company,
      d.title,
      d.drive_date,
      d.deadline,
      d.venue,
      d.mode,
      d.eligibility,
      d.status,
      d.created_at
    FROM placement_drives d
    INNER JOIN companies c ON c.id = d.company_id
    ORDER BY d.drive_date ASC, d.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Failed to fetch placement drives:", err.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch placement drives",
      });
    }

    return res.json({
      success: true,
      drives: results.map((drive) => ({
        ...drive,
        date: drive.drive_date
          ? new Date(drive.drive_date).toISOString().slice(0, 10)
          : null,
      })),
    });
  });
});

// POST /api/drives
router.post("/", authenticateToken, requireOfficer, (req, res) => {
  const {
    company_id,
    title,
    date,
    drive_date,
    deadline,
    venue,
    mode,
    eligibility,
    status,
  } = req.body || {};

  const companyId = Number(company_id);
  const driveDate = drive_date || date;
  const selectedMode = mode || "Offline";
  const selectedStatus = status || "Upcoming";

  if (
    !Number.isInteger(companyId) ||
    companyId <= 0 ||
    typeof title !== "string" ||
    !title.trim() ||
    !validDate(driveDate)
  ) {
    return res.status(400).json({
      success: false,
      message: "A valid company, title, and drive date are required",
    });
  }

  if (!["Offline", "Online", "Hybrid"].includes(selectedMode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid drive mode",
    });
  }

  if (!["Upcoming", "Open", "Completed", "Cancelled"].includes(selectedStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid drive status",
    });
  }

  if (deadline && !validDate(deadline)) {
    return res.status(400).json({
      success: false,
      message: "Deadline must be a valid date",
    });
  }

  db.query(
    "SELECT id FROM companies WHERE id = ?",
    [companyId],
    (companyErr, companies) => {
      if (companyErr) {
        console.error("Company lookup failed:", companyErr.message);
        return res.status(500).json({
          success: false,
          message: "Failed to validate company",
        });
      }

      if (companies.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected company does not exist",
        });
      }

      const sql = `
        INSERT INTO placement_drives
          (company_id, title, drive_date, deadline, venue, mode, eligibility, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        companyId,
        title.trim(),
        driveDate,
        deadline || null,
        venue || null,
        selectedMode,
        eligibility || null,
        selectedStatus,
      ];

      db.query(sql, values, (insertErr, result) => {
        if (insertErr) {
          console.error("Failed to create placement drive:", insertErr.message);
          return res.status(500).json({
            success: false,
            message: "Failed to create placement drive",
          });
        }

        return res.status(201).json({
          success: true,
          message: "Placement drive created successfully",
          driveId: result.insertId,
        });
      });
    }
  );
});

// PUT /api/drives/:id
router.put("/:id", authenticateToken, requireOfficer, (req, res) => {
  const id = Number(req.params.id);
  const {
    company_id,
    title,
    date,
    drive_date,
    deadline,
    venue,
    mode,
    eligibility,
    status,
  } = req.body || {};

  const companyId = Number(company_id);
  const driveDate = drive_date || date;
  const selectedMode = mode || "Offline";
  const selectedStatus = status || "Upcoming";

  if (
    !Number.isInteger(id) ||
    id <= 0 ||
    !Number.isInteger(companyId) ||
    companyId <= 0 ||
    typeof title !== "string" ||
    !title.trim() ||
    !validDate(driveDate)
  ) {
    return res.status(400).json({
      success: false,
      message: "Valid drive ID, company, title, and date are required",
    });
  }

  if (!["Offline", "Online", "Hybrid"].includes(selectedMode)) {
    return res.status(400).json({
      success: false,
      message: "Invalid drive mode",
    });
  }

  if (!["Upcoming", "Open", "Completed", "Cancelled"].includes(selectedStatus)) {
    return res.status(400).json({
      success: false,
      message: "Invalid drive status",
    });
  }

  if (deadline && !validDate(deadline)) {
    return res.status(400).json({
      success: false,
      message: "Deadline must be a valid date",
    });
  }

  const sql = `
    UPDATE placement_drives
    SET company_id = ?, title = ?, drive_date = ?, deadline = ?,
        venue = ?, mode = ?, eligibility = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      companyId,
      title.trim(),
      driveDate,
      deadline || null,
      venue || null,
      selectedMode,
      eligibility || null,
      selectedStatus,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Failed to update placement drive:", err.message);
        return res.status(500).json({
          success: false,
          message: "Failed to update placement drive",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Placement drive not found or unchanged",
        });
      }

      return res.json({
        success: true,
        message: "Placement drive updated successfully",
      });
    }
  );
});

// DELETE /api/drives/:id
router.delete("/:id", authenticateToken, requireOfficer, (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid placement drive ID",
    });
  }

  db.query(
    "DELETE FROM placement_drives WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Failed to delete placement drive:", err.message);

        if (err.code === "ER_ROW_IS_REFERENCED_2") {
          return res.status(409).json({
            success: false,
            message: "This drive has applications and cannot be deleted",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to delete placement drive",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Placement drive not found",
        });
      }

      return res.json({
        success: true,
        message: "Placement drive deleted successfully",
      });
    }
  );
});

module.exports = router;
