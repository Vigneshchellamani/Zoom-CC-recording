const express = require("express");
const router = express.Router();
const { handleEngagementEnded } = require("../utils/zoom");

router.post("/", async (req, res) => {
  try {
    const event = req.body.event;
    if (event === "contact_center.engagement_ended") {
      const engagementId = req.body.payload?.engagement?.id;
      // const engagementId = req.body.payload?.object?.engagement_id;
      console.log("📩 Webhook received for engagement:", engagementId);

      if (!engagementId) return res.status(400).send("Engagement ID missing");

      // Download recording
      await handleEngagementEnded(engagementId);
    }
    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("❌ Error handling webhook:", err.message);
    res.status(500).send("Webhook error");
  }
});

module.exports = router;
