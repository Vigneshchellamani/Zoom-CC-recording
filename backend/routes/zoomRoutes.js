const express = require("express");
const { handleEngagementEnded } = require("../utils/zoom");

const router = express.Router();

/**
 * Zoom webhook receiver
 * IMPORTANT: Respond 200 quickly to avoid retries/timeouts.
 * (Add Zoom signature validation if you like.)
 */
router.post("/webhook", (req, res) => {
  try {
    const { event, payload } = req.body || {};
    const engagementId = payload?.object?.engagement_id;
    const companyId = payload?.account_id ? String(payload.account_id) : "default";

    res.status(200).send("ok"); // ACK first

    if (event === "contact_center.engagement_ended" && engagementId) {
      handleEngagementEnded(engagementId, companyId).catch(err =>
        console.error("Webhook async error:", err.message)
      );
    } else {
      console.warn("Webhook ignored: invalid event or engagement_id missing");
    }
  } catch (e) {
    console.error("Webhook error:", e.message);
    res.status(200).send("ok"); // still ACK
  }
});

module.exports = router;
