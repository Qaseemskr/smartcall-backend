/* ===============================
   SMARTCALL BACKEND INDEX.JS
   =============================== */

import express from "express";
import cors from "cors";
import africastalking from "africastalking";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- AFRICA'S TALKING CONFIG ---------- */
const AT_USERNAME = "SmartCall-Live";
const AT_API_KEY = "atsk_765307edb657c3e63dad04889136f3a3c7cbb691f3ed8e993e79235ce07258601f3dc22d";
const CALLER_ID = "+2342017001172";

const at = africastalking({
  apiKey: AT_API_KEY,
  username: AT_USERNAME,
});

const voice = at.VOICE;

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("✅ SmartCall Backend is Live!");
});

/* ============================================
    🔥 NEW: WEBRTC TOKEN ENDPOINT
   ============================================ */
app.get("/webrtc/token", async (req, res) => {
  try {
    const token = await voice.webrtc.token();
    res.json({ success: true, token });
  } catch (error) {
    console.error("❌ WebRTC Token Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------- START CALL ---------- */
app.post("/api/call", async (req, res) => {
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ success: false, error: "Missing 'to' number." });
  }

  try {
    const result = await voice.call({
      callFrom: CALLER_ID,
      callTo: [to],
      url: "https://smartcall-backend-7cm9.onrender.com/voice", 
    });

    console.log("📞 Call attempt result:", result);

    const entry = result?.entries?.[0];
    const callStatus = entry?.status || "Unknown";

    // Check for insufficient balance or other failures
    if (
      callStatus.toLowerCase().includes("failed") ||
      callStatus.toLowerCase().includes("insufficientcredit") ||
      callStatus.toLowerCase().includes("rejected") ||
      callStatus.toLowerCase().includes("error")
    ) {
      console.log("❌ Call blocked due to:", callStatus);
      return res.status(400).json({
        success: false,
        error:
          "We are currently upgrading our SmartCall main wallet to improve call quality and reliability. During this short maintenance period, calls may not connect.
Ee truly apologise for any incomvinience this my cause, Thank you for your kind understanding and patience — we truly appreciate you.",
      });
    }

    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Call error:", error);
    res.status(500).json({
      success: false,
      error: "Server error: " + (error.message || "Unknown error occurred."),
    });
  }
});

/* ============================================
    🔥 UPDATED: VOICE CALLBACK FOR WEBRTC AUDIO
   ============================================ */
app.post("/voice", (req, res) => {
  console.log("📞 Voice callback received:", req.body);

  const isInbound = req.body.isActive === "1";

  if (isInbound) {
    // WebRTC XML response
    const xmlResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial>
          <Client>webrtc</Client>
        </Dial>
      </Response>
    `;
    res.set("Content-Type", "application/xml");
    return res.send(xmlResponse);
  }

  console.log("📴 Call ended summary:", req.body);
  res.status(200).send("OK");
});

/* ---------- END CALL ---------- */
app.post("/api/end", async (req, res) => {
  try {
    const result = await voice.hangupAll();
    console.log("✅ Hangup success:", result);
    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Hangup error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`🚀 SmartCall backend running on port ${PORT}`)
);

