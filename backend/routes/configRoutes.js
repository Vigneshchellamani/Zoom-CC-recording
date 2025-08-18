const express = require("express");
const { encrypt } = require("../utils/crypto");
const ZoomConfig = require("../models/ZoomConfig");

const router = express.Router();

// Save/update Zoom credentials for a company
router.post("/zoom", async (req, res) => {
  try {
    const { companyId, clientId, clientSecret, accountId } = req.body;
    if (!companyId || !clientId || !clientSecret || !accountId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cfg = await ZoomConfig.findOneAndUpdate(
      { companyId },
      {
        clientIdEnc: encrypt(clientId),
        clientSecretEnc: encrypt(clientSecret),
        accountIdEnc: encrypt(accountId)
      },
      { upsert: true, new: true }
    );

    res.json({ message: "✅ Zoom config saved", cfg });
  } catch (err) {
    console.error("Save ZoomConfig error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Fetch Zoom config (for admin/debugging)
router.get("/zoom/:companyId", async (req, res) => {
  try {
    const cfg = await ZoomConfig.findOne({ companyId: req.params.companyId });
    res.json(cfg || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
