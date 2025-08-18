const mongoose = require("mongoose");

const zoomConfigSchema = new mongoose.Schema({
  companyId:   { type: String, unique: true },
  clientIdEnc: String,
  clientSecretEnc: String,
  accountIdEnc: String
}, { timestamps: true });

module.exports = mongoose.model("ZoomConfig", zoomConfigSchema);
