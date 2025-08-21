// const express = require("express");
// const Engagement = require("../models/Engagement");
// const auth = require("../middleware/auth");
// const roles = require("../middleware/roles");

// const router = express.Router();

// // Admin: list all engagements in their company (you can scope admin differently if needed)
// router.get("/all", auth, roles("admin"), async (req, res) => {
//   const list = await Engagement.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).limit(500);
//   res.json(list);
// });

// // Agent: list only their company (or further scope by agent field if you track IDs)
// router.get("/mine", auth, roles("agent", "admin"), async (req, res) => {
//   const list = await Engagement.find({ companyId: req.user.companyId }).sort({ createdAt: -1 }).limit(200);
//   res.json(list);
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Engagement = require("../models/Engagement");
const authMiddleware = require("../middleware/auth");

router.get("/all", authMiddleware, async (req, res) => {
  try {
    const user = req.user; // decoded from JWT
    let engagements;

    if (user.role === "admin") {
      engagements = await Engagement.find().sort({ startTime: -1 });
    } else if (user.role === "agent") {
      engagements = await Engagement.find({ agent: user.name }).sort({ startTime: -1 });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(engagements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
