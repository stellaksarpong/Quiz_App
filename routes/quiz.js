const express = require("express");
const router = express.Router();
const db = require("../config/db");
const axios = require('axios');


router.post("/request-password-reset", (req, res) => {
  const { email } = req.body;

  // Check if the user exists
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a reset token
    const token = jwt.sign({ id: results[0].id }, "your_jwt_secret", { expiresIn: "15m" });

    // Send reset link via email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: "your-email@gmail.com", pass: "your-password" },
    });

    const mailOptions = {
      to: email,
      subject: "Password Reset",
      text: `Please use the following link to reset your password: http://localhost:3000/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "Password reset email sent" });
    });
  });
});

// Fetch 50 general knowledge IT questions from external API and create a quiz
router.post("/create", async (req, res) => {
  const { title, description } = req.body; // get title and description from the request

  try {
    // Fetch questions from the Open Trivia Database API
    const response = await axios.get('https://opentdb.com/api.php?amount=50&category=18&difficulty=hard');
    const questions = response.data.results; // Extract questions from the response

    // Save the quiz with the fetched questions to the database
    db.query(
      "INSERT INTO quizzes (title, description, questions) VALUES (?, ?, ?)",
      [title, description, JSON.stringify(questions)],
      (err) => {
        if (err) {
          console.error("Database error while creating quiz:", err);
          return res.status(500).json({ message: "Error creating quiz" });
        }
        res.status(201).json({ message: "Quiz created successfully!" });
      }
    );
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Failed to fetch quiz questions" });
  }
});

// Get all quizzes
router.get("/", (req, res) => {
  db.query("SELECT * FROM quizzes", (err, results) => {
    if (err) {
      console.error("Database error while fetching quizzes:", err);
      return res.status(500).json({ message: "Error fetching quizzes" });
    }
    res.json(results);
  });
});

// Submit a quiz
router.post("/submit", (req, res) => {
  const { userId, quizId, score } = req.body;

  db.query(
    "INSERT INTO results (user_id, quiz_id, score) VALUES (?, ?, ?)",
    [userId, quizId, score],
    (err) => {
      if (err) {
        console.error("Database error while submitting quiz:", err);
        return res.status(500).json({ message: "Error submitting quiz" });
      }
      res.status(201).json({ message: "Quiz submitted successfully!" }); 

    }
  );
});

// Get results for a specific quiz
router.get("/results/:quizId", (req, res) => {
  const { quizId } = req.params;

  db.query(
    "SELECT * FROM results WHERE quiz_id = ?",
    [quizId],
    (err, results) => {
      if (err) {
        console.error("Database error while fetching quiz results:", err);
        return res.status(500).json({ message: "Error fetching quiz results" });
      }
      res.json(results);
    }
  );
});

module.exports = router;
