const express = require("express");
const router = express.Router();
const { handleEngagementEnded } = require("../utils/zoom");

// Webhook endpoint from Zoom
router.post("/", async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log("📩 Webhook received:", event);

    if (event === "contact_center.engagement.ended") {
      const engagementId = payload.engagement_id;
      const accountId = payload.account_id || "default";

      await handleEngagementEnded(engagementId, accountId);
    }

    res.status(200).send({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;
