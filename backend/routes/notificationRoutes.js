const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("./authMiddleware");

// Get notifications for the logged-in user
router.get("/", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, title, message, type, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Fetch notifications error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }

    res.json({
      success: true,
      notifications: results,
      unreadCount: results.filter((n) => !n.is_read).length,
    });
  });
});

// Mark one notification as read
router.patch("/:id/read", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [notificationId, userId], (err, result) => {
    if (err) {
      console.error("Mark notification read error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update notification",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  });
});

// Mark all notifications as read
router.patch("/read-all", authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId],
    (err) => {
      if (err) {
        console.error("Mark all notifications read error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update notifications",
        });
      }

      res.json({
        success: true,
        message: "All notifications marked as read",
      });
    }
  );
});

module.exports = router;