const express = require("express");
const axios = require("axios");
const User = require("../models/user");

const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/* ============================
   STEP 1: Redirect to GitHub
============================= */
router.get("/auth/github", (req, res) => {
  const redirectURL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user`;
  res.redirect(redirectURL);
});

/* ============================
   STEP 2: GitHub OAuth callback
============================= */
router.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return res.status(400).send("No access token returned");

    // Fetch GitHub user
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    const gh = userRes.data;

    // Upsert user in DB
    const user = await User.findOneAndUpdate(
      { githubId: String(gh.id) },
      {
        githubId: String(gh.id),
        username: gh.login,
        displayName: gh.name || gh.login,
        avatar: gh.avatar_url,
        accessToken,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Store session
    req.session.user = {
      id: user._id.toString(),
      githubId: user.githubId,
      username: user.username,
    };

    req.session.githubToken = accessToken;

    return res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("OAuth error:", err.response?.data || err);
    res.status(500).send("GitHub OAuth failed");
  }
});

/* ============================
   Check Auth Status
============================= */
router.get("/auth", async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ ok: false, message: "Not logged in" });
  }

  const user = await User.findById(req.session.user.id).select("-accessToken");

  return res.json({ ok: true, user });
});

/* ============================
   Logout
============================= */
router.post("/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

module.exports = router;
