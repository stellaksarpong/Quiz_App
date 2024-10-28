// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const nodemailer = require("nodemailer");

const router = express.Router();

// Existing routes: signup, login...

// Reset password route
router.post("/reset-password", (req, res) => {
  const { token, newPassword } = req.body;

  jwt.verify(token, "your_jwt_secret", (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    bcrypt.hash(newPassword, 10, (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).send("Error updating password");
      }

      db.query("UPDATE users SET password = ? WHERE id = ?", [hash, decoded.id], (err) => {
        if (err) {
          console.error("Database error while updating password:", err);
          return res.status(500).send("Error updating password");
        }
        res.status(200).send("Password updated successfully");
      });
    });
  });
});


// User Login Route
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user in the database
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Database error while fetching user:", err);
        return res.status(500).json({ message: "Error fetching user" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Compare the provided password with the stored hashed password
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error("Error comparing passwords:", err);
          return res.status(500).json({ message: "Error logging in" });
        }
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token for the user
        const token = jwt.sign({ id: user.id }, "your_jwt_secret", {
          expiresIn: "1h",
        });
        res.json({ token });
      });
       
    }
  );
});

module.exports = router;
