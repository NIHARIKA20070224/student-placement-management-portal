require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing project routes
app.use("/api", require("./routes/testRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/drives", require("./routes/driveRoutes"));
app.use("/api/officer", require("./routes/officerRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CareerConnect backend is running",
  });
});

async function startServer() {
  try {
    await db.initializeDatabase();

    app.listen(PORT, () => {
      console.log(
        `CareerConnect server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  }
}

startServer();