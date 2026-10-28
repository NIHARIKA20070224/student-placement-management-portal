require("dotenv").config();

const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const databaseName = process.env.DB_NAME || "student_placement";

if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
  throw new Error("Invalid database name in .env");
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT || 3306),
});

function queryAsync(sql, values = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

async function initializeDatabase() {
  await queryAsync(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);

  await new Promise((resolve, reject) => {
    db.changeUser({ database: databaseName }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  // TABLE 1: USERS
  await queryAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(150) NOT NULL,
      roll_number VARCHAR(50) NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(30) NULL,
      branch VARCHAR(100) NULL,
      cgpa DECIMAL(4,2) NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('student', 'officer', 'admin')
        NOT NULL DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // TABLE 2: COMPANIES
  await queryAsync(`
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      role VARCHAR(200) NOT NULL,
      location VARCHAR(255) DEFAULT '',
      \`package\` VARCHAR(100) DEFAULT '',
      eligibility TEXT,
      skills TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  // TABLE 3: PLACEMENT DRIVES
  await queryAsync(`
    CREATE TABLE IF NOT EXISTS placement_drives (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      drive_date DATE NOT NULL,
      deadline DATE NULL,
      venue VARCHAR(255) NULL,
      mode ENUM('Offline', 'Online', 'Hybrid')
        NOT NULL DEFAULT 'Offline',
      eligibility TEXT NULL,
      status ENUM('Upcoming', 'Open', 'Completed', 'Cancelled')
        NOT NULL DEFAULT 'Upcoming',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    ) ENGINE=InnoDB
  `);

  // TABLE 4: APPLICATIONS
  await queryAsync(`
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      drive_id INT NULL,
      full_name VARCHAR(150) NOT NULL,
      roll_number VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      branch VARCHAR(100) NOT NULL,
      cgpa DECIMAL(4,2) NOT NULL,
      skills TEXT NOT NULL,
      message TEXT,
      resume_name VARCHAR(255) NOT NULL,
      status ENUM(
        'Applied',
        'Under Review',
        'Shortlisted',
        'Selected',
        'Rejected'
      ) NOT NULL DEFAULT 'Applied',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      FOREIGN KEY (drive_id)
        REFERENCES placement_drives(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    ) ENGINE=InnoDB
  `);

  // TABLE 5: NOTIFICATIONS
  await queryAsync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'general',
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // CREATE OR CORRECT THE DEFAULT OFFICER ACCOUNT
  const officerEmail = "officer@careerconnect.local";
  const officerPassword = "officer@123";
  const hashedPassword = await bcrypt.hash(officerPassword, 10);

  await queryAsync(
    `INSERT INTO users (full_name, email, password, role)
     VALUES (?, ?, ?, 'officer')
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       password = VALUES(password),
       role = 'officer'`,
    ["Placement Officer", officerEmail, hashedPassword]
  );

  console.log("Database initialization completed.");
  console.log("Five database tables are ready.");
  console.log("Default placement officer account is ready.");
}

// Export the connection directly for compatibility with existing routes.
module.exports = db;
module.exports.initializeDatabase = initializeDatabase;