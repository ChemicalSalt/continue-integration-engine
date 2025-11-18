// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user"); // your User model
const passport = require("passport"); // for OAuth
const router = express.Router();

// ---------------- MANUAL REGISTER ----------------
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email & password required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed });

    req.session.user = { id: user._id, email: user.email };
    res.json({ user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- MANUAL LOGIN ----------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email & password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    req.session.user = { id: user._id, email: user.email };
    res.json({ user: req.session.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------------- LOGOUT ----------------
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

// ---------------- GET CURRENT USER ----------------
router.get("/user", (req, res) => {
  if (!req.session?.user) return res.status(401).json({ message: "Not authenticated" });
  res.json({ user: req.session.user });
});

// ---------------- GOOGLE OAUTH ----------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  (req, res) => {
    req.session.user = { id: req.user._id, email: req.user.email };
    res.redirect("/dashboard");
  }
);

// ---------------- GITHUB OAUTH ----------------
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login", session: true }),
  (req, res) => {
    req.session.user = { id: req.user._id, email: req.user.email };
    res.redirect("/dashboard");
  }
);

module.exports = router;
