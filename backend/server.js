
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import route files
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const driveRoutes = require("./routes/driveRoutes");
const officerRoutes = require("./routes/officerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Register API routes
app.use("/api", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/drives", driveRoutes);
app.use("/api/officer", officerRoutes);
app.use("/api/notifications", notificationRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerConnect backend is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`CareerConnect server running on http://localhost:${PORT}`);
});
