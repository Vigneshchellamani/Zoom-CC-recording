const express = require("express");
const Engagement = require("../models/Engagement");
const auth = require("../middleware/auth");
const roles = require("../middleware/roles");

const router = express.Router();

// Admin: list all engagements in their company (you can scope admin differently if needed)
router.get("/all", auth, roles("admin"), async (req, res) => {
  const list = await Engagement.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).limit(500);
  res.json(list);
});

// Agent: list only their company (or further scope by agent field if you track IDs)
router.get("/mine", auth, roles("agent", "admin"), async (req, res) => {
  const list = await Engagement.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).limit(200);
  res.json(list);
});

module.exports = router;
