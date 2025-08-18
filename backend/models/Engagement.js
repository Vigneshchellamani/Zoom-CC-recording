const mongoose = require("mongoose");

const engagementSchema = new mongoose.Schema({
  companyId:   { type: String, index: true },
  engagementId:{ type: String, unique: true, required: true },
  direction:   String,
  startTime:   Date,
  duration:    Number,
  agent:       String,
  queue:       String,
  channel:     String,
  flow:        String,
  disposition: String,
  notes:       String,
  transcript:  String,
  recordingUrl:String,
  s3Path:      String
}, { timestamps: true });

module.exports = mongoose.model("Engagement", engagementSchema);
