
const express = require("express");
const router = express.Router();

const db = require("../db");
const authenticateToken = require("./authMiddleware");

// Allow only authenticated placement officers to manage companies.
function requireOfficer(req, res, next) {
  if (!req.user || req.user.role !== "officer") {
    return res.status(403).json({
      success: false,
      message: "Only placement officers can manage companies.",
    });
  }

  next();
}

// Get all companies (available to students and officers).
router.get("/", (req, res) => {
  const sql = "SELECT * FROM companies ORDER BY name ASC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching companies:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch companies.",
      });
    }

    return res.json({
      success: true,
      companies: results,
    });
  });
});

// Add a company (officers only).
router.post("/", authenticateToken, requireOfficer, (req, res) => {
  const {
    name,
    role,
    location,
    package: companyPackage,
    eligibility,
    skills,
  } = req.body;

  if (!name || !name.trim() || !role || !role.trim()) {
    return res.status(400).json({
      success: false,
      message: "Company name and job role are required.",
    });
  }

  const sql = `
    INSERT INTO companies
      (name, role, location, \`package\`, eligibility, skills)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name.trim(),
    role.trim(),
    location?.trim() || "",
    companyPackage?.toString().trim() || "",
    eligibility?.trim() || "",
    skills?.trim() || "",
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error adding company:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to add company. Please check the company table columns.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Company added successfully.",
      company: {
        id: result.insertId,
        name: name.trim(),
        role: role.trim(),
        location: location?.trim() || "",
        package: companyPackage?.toString().trim() || "",
        eligibility: eligibility?.trim() || "",
        skills: skills?.trim() || "",
      },
    });
  });
});

// Update a company (officers only).
router.put("/:id", authenticateToken, requireOfficer, (req, res) => {
  const companyId = Number(req.params.id);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid company ID.",
    });
  }

  const {
    name,
    role,
    location,
    package: companyPackage,
    eligibility,
    skills,
  } = req.body;

  if (!name || !name.trim() || !role || !role.trim()) {
    return res.status(400).json({
      success: false,
      message: "Company name and job role are required.",
    });
  }

  const sql = `
    UPDATE companies
    SET name = ?,
        role = ?,
        location = ?,
        \`package\` = ?,
        eligibility = ?,
        skills = ?
    WHERE id = ?
  `;

  const values = [
    name.trim(),
    role.trim(),
    location?.trim() || "",
    companyPackage?.toString().trim() || "",
    eligibility?.trim() || "",
    skills?.trim() || "",
    companyId,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating company:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update company.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Company not found or no changes were made.",
      });
    }

    return res.json({
      success: true,
      message: "Company updated successfully.",
    });
  });
});

// Delete a company (officers only).
// MySQL foreign-key constraints may prevent deleting a company
// that is referenced by existing placement drives.
router.delete("/:id", authenticateToken, requireOfficer, (req, res) => {
  const companyId = Number(req.params.id);

  if (!Number.isInteger(companyId) || companyId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid company ID.",
    });
  }

  db.query(
    "DELETE FROM companies WHERE id = ?",
    [companyId],
    (err, result) => {
      if (err) {
        console.error("Error deleting company:", err);

        if (err.code === "ER_ROW_IS_REFERENCED_2") {
          return res.status(409).json({
            success: false,
            message:
              "This company is linked to existing placement drives. Keep the record to preserve those relationships.",
          });
        }

        return res.status(500).json({
          success: false,
          message: "Failed to delete company.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Company not found.",
        });
      }

      return res.json({
        success: true,
        message: "Company deleted successfully.",
      });
    }
  );
});

module.exports = router;
