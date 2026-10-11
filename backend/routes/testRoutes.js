const express = require("express");
const router = express.Router();

const db = require("../db");

router.get("/test-db", (req, res) => {
  db.query("SELECT DATABASE() AS database_name", (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database query failed",
        error: err.message,
      });
    }

    res.json({
      success: true,
      message: "Database is working!",
      database: results[0].database_name,
    });
  });
});

module.exports = router;