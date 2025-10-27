/* ===============================
   SMARTCALL BACKEND INDEX.JS (FINAL)
   =============================== */

import express from "express";
import cors from "cors";
import africastalking from "africastalking";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- AFRICA'S TALKING CONFIG ---------- */
const AT_USERNAME = "SmartCall-Live"; // Your Africa's Talking live username
const AT_API_KEY = "atsk_765307edb657c3e63dad04889136f3a3c7cbb691f3ed8e993e79235ce07258601f3dc22d"; // Your live API key
const CALLER_ID = "+2342017001172"; // Your verified virtual number on Africa's Talking

// Initialize SDK
const at = africastalking({
  apiKey: AT_API_KEY,
  username: AT_USERNAME,
});

const voice = at.VOICE;

/* ---------- BASIC TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("✅ SmartCall Backend is Live and Connected to Africa's Talking!");
});

/* ---------- MAKE CALL ---------- */
app.post("/api/call", async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ success: false, error: "Missing 'to' number." });

  try {
    const result = await voice.call({
      callFrom: CALLER_ID,
      callTo: [to],
    });

    console.log("📞 Call started:", result);
    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Call error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------- VOICE CALLBACK HANDLER ---------- */
app.post("/voice", (req, res) => {
  console.log("🎧 Voice callback received:", req.body);

  const { isActive, callerNumber, sessionId, direction } = req.body;

  if (isActive === "1") {
    // Incoming active call - Respond with XML to connect
    const xmlResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="man">Welcome to SmartCall. Please wait while we connect your call.</Say>
        <Dial phoneNumbers="${callerNumber}"/>
      </Response>
    `;
    res.set("Content-Type", "application/xml");
    res.send(xmlResponse);
  } else {
    // Call has ended
    console.log("📞 Call ended or summary:", req.body);
    res.status(200).send("OK");
  }
});

/* ---------- END CALL (SAFE HANDLER) ---------- */
app.post("/api/end", async (req, res) => {
  try {
    console.log("📴 End call request received from frontend.");
    // Note: Africa's Talking automatically handles hangups.
    res.json({ success: true, message: "Call ended successfully (no manual hangup needed)." });
  } catch (error) {
    console.error("❌ End call error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------- SERVER LISTENER ---------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 SmartCall backend running on port ${PORT}`);
  console.log("🌐 Callback URL should be set to: https://smartcall-backend-7cm9.onrender.com/voice");
});
