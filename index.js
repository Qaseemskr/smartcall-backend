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
const AT_USERNAME = "SmartCall-Live"; // your Africa's Talking username
const AT_API_KEY = "atsk_765307edb657c3e63dad04889136f3a3c7cbb691f3ed8e993e79235ce07258601f3dc22d"; // your real API key
const CALLER_ID = "+2342017001172"; // your Africa's Talking virtual number

const at = africastalking({
  apiKey: AT_API_KEY,
  username: AT_USERNAME,
});

const voice = at.VOICE;

/* ---------- TEST ROUTE ---------- */
app.get("/", (req, res) => {
  res.send("✅ SmartCall Backend is Live!");
});

/* ---------- START CALL ---------- */
app.post("/api/call", async (req, res) => {
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ success: false, error: "Missing 'to' number." });
  }

  try {
    // Attempt to initiate the call via Africa's Talking
    const result = await voice.call({
      callFrom: CALLER_ID,
      callTo: [to],
      url: "https://smartcall-backend-7cm9.onrender.com/voice",
    });

    console.log("📞 Call attempt result:", result);

    // Check for insufficient wallet balance or general call failure
    if (!result || result.errorMessage !== "None") {
      console.log("❌ Africa's Talking call failed:", result.errorMessage);
      return res.status(400).json({
        success: false,
        error: "You do not have sufficient balance to make this call. Please recharge your wallet and try again. Thank you for using SmartCall.",
      });
    }

    // If call was queued successfully
    res.json({ success: true, result });
  } catch (error) {
    console.error("❌ Call error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error: " + (error.message || "Unknown error occurred."),
    });
  }
});

/* ---------- VOICE CALLBACK ---------- */
app.post("/voice", (req, res) => {
  console.log("📞 Voice callback received:", req.body);

  const isInbound = req.body.isActive === "1";

  if (isInbound) {
    // Active call — respond with XML instructions
    const xmlResponse = `
      <?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="man">Welcome to SmartCall. Connecting your call now.</Say>
        <Dial phoneNumbers="${req.body.callerNumber}"/>
      </Response>
    `;
    res.set("Content-Type", "application/xml");
    res.send(xmlResponse);
  } else {
    // Call has ended — just acknowledge
    console.log("📴 Call summary:", req.body);
    res.status(200).send("OK");
  }
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
const PORT = process.env.PORT || 10000; // Render sets this automatically
app.listen(PORT, () => console.log(`🚀 SmartCall backend running on port ${PORT}`));

