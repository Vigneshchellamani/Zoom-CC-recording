const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Engagement = require("../models/Engagement");
const ZoomConfig = require("../models/ZoomConfig");
const { decrypt } = require("./crypto");

let cachedConfig = null;

async function loadZoomConfig() {
  if (cachedConfig) return cachedConfig;

  const cfg = await ZoomConfig.findOne();
  if (!cfg) throw new Error("⚠️ No Zoom configuration found.");

  cachedConfig = {
    clientId: decrypt(cfg.clientIdEnc),
    clientSecret: decrypt(cfg.clientSecretEnc),
    accountId: decrypt(cfg.accountIdEnc),
  };
  return cachedConfig;
}

async function getAccessToken() {
  const { clientId, clientSecret, accountId } = await loadZoomConfig();

  const res = await axios.post("https://zoom.us/oauth/token", null, {
    params: { grant_type: "account_credentials", account_id: accountId },
    auth: { username: clientId, password: clientSecret },
  });

  return res.data.access_token;
}

async function getRecording(accessToken, engagementId) {
  const url = `https://api.zoom.us/v2/contact_center/engagements/${engagementId}/recordings`;

  console.log(`📡 Fetching recording: ${url}`);

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  
  const rec = res.data.recordings?.find(r => r.channel === "voice");
  if (!rec) throw new Error("No recording found for engagement " + engagementId);

  const downloadUrl = rec.download_url;
  const ext = rec.file_extension ? `.${rec.file_extension}` : ".mp3";
  const fileName = `${engagementId}${ext}`;

  const startTime = res.data.start_time ? new Date(res.data.start_time) : new Date();

  return { downloadUrl, fileName, startTime, meta: res.data, recording: rec };
}

async function streamDownload(downloadUrl, accessToken, absPath) {
  await fs.promises.mkdir(path.dirname(absPath), { recursive: true });

  console.log(`⬇️ Downloading recording to ${absPath}`);

  const writer = fs.createWriteStream(absPath);
  const res = await axios.get(downloadUrl, {
    responseType: "stream",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return new Promise((resolve, reject) => {
    res.data.pipe(writer);
    writer.on("finish", () => {
      console.log("✅ Download complete:", absPath);
      resolve(absPath);
    });
    writer.on("error", reject);
  });
}

async function handleEngagementEnded(engagementId) {
  console.log(`⚙️ Handling engagement ${engagementId}`);

  const token = await getAccessToken();

  // Fetch full engagement info
  const engagementRes = await axios.get(
    `https://api.zoom.us/v2/contact_center/engagements/${engagementId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const engagementData = engagementRes.data;

  // Fetch recording
  const { downloadUrl, fileName, startTime, recording } = await getRecording(token, engagementId);

  const dir = path.join(
    __dirname,
    "..",
    "uploads",
    "recordings",
    String(startTime.getFullYear()),
    String(startTime.getMonth() + 1).padStart(2, "0"),
    String(startTime.getDate()).padStart(2, "0")
  );
  const absPath = path.join(dir, fileName);
  await streamDownload(downloadUrl, token, absPath);

  // Save everything to MongoDB
  // await Engagement.findOneAndUpdate(
  //   { engagementId },
  //   {
  //     engagementId,
  //     startTime,
  //     duration: recording.duration||engagementData.duration || 0,
  //     agent: recording.agent_name ||engagementData.agent_name ||"",
  //     queue: recording.queue_name ||engagementData.queue_name ||"",
  //     channel: recording.channel ||engagementData.channel ||"",
  //     flow: recording.flow_name ||engagementData.flow_name ||"",
  //     disposition: recording.disposition ||engagementData.disposition|| "",
  //     recordingUrl: downloadUrl,
  //     localPath: absPath,
  //     // New fields from engagement data
  //     direction: engagementData.direction || "",
  //     consumer: engagementData.consumer?.name || "",
  //     source: engagementData.source || "",
  //     waitingDuration: engagementData.waiting_duration || 0,
  //     handlingDuration: engagementData.handling_duration || 0,
  //     wrapUpDuration: engagementData.wrap_up_duration || 0,
  //     notes: engagementData.notes || "",
  //     transcript: engagementData.transcript || "",
  //     voicemail: engagementData.voicemail || false,
  //     recordingConsent: engagementData.recording_consent || false,
  //   },
  //   { upsert: true, new: true }
  // );

await Engagement.findOneAndUpdate(
  { engagementId },
  {
    engagementId,
    startTime,
    duration: recording.duration || engagementData.duration || 0,

    // Correctly extract first consumer / agent / queue / flow
    consumer: engagementData.consumers?.[0]?.consumer_display_name || "",
    agent: engagementData.agents?.map(a => a.display_name).join(", ") || "", // store multiple agents
    queue: engagementData.queues?.[0]?.queue_name || "",
    flow: engagementData.flows?.[0]?.flow_name || "",
    disposition: engagementData.disposition || "",

    // Recording
    channel: recording.channel || engagementData.channel || "",
    recordingUrl: downloadUrl,
    localPath: absPath,

    // Other engagement metadata
    direction: engagementData.direction || "",
    source: engagementData.source || "",
    waitingDuration: engagementData.waiting_duration || 0,
    handlingDuration: engagementData.handling_duration || 0,
    wrapUpDuration: engagementData.wrap_up_duration || 0,
    notes: engagementData.notes || "",
    transcript: engagementData.transcript_url || "",
    voicemail: engagementData.voice_mail ? true : false,
    recordingConsent: engagementData.recording_consent || false,
  },
  { upsert: true, new: true }
);

  console.log(`✅ Saved full engagement info for ${engagementId} at ${absPath}`);
}

module.exports = { handleEngagementEnded, loadZoomConfig };
