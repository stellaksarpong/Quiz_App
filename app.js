
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const app = express();
const logger = require('morgan');
const checkRole = require('./path/to/checkRole'); 



// Middleware
app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use("/api/admin", checkRole("admin"));

// Register the routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);

const checkRole = (requiredRole) => (req, res, next) => {
  const { role } = req.user; 
  if (role !== requiredRole) {
    console.log(`Access denied for ${req.user.username} with role ${role}`);
    return res.status(403).json({ message: "Access denied" });
  }
  console.log(`Access granted for ${req.user.username} with role ${role}`);
  next();
};

router.post("/admin-only", checkRole("admin"), (req, res) => {
  console.log(`Admin content accessed by ${req.user.username}`);
  res.send("Admin content");
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
