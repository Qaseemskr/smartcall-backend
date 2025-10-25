/* ===============================
   SMARTCALL BACKEND INDEX.JS
   =============================== */

import express from "express";
import cors from "cors";
import africastalking from "africastalking";

const app = express();
app.use(cors());
app.use(express.json());

/* ---------- AFRICA'S TALKING CONFIG ---------- */
const AT_USERNAME = "SmartCall-Live"; // your Africa's Talking username
const AT_API_KEY = "atsk_765307edb657c3e63dad04889136f3a3c7cbb691f3ed8e993e79235ce07258601f3dc22d"; // your real API key
const CALLER_ID = "+2342017001172"; // your virtual number from Africa's Talking

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

  if (!to) return res.status(400).json({ success: false, error: "Missing 'to' number." });

  try {
    const result = await voice.call({
      callFrom: CALLER_ID,
      callTo: [to],
    });

    console.log("Call success:", result);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Call error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------- END CALL ---------- */
app.post("/endCall", async (req, res) => {
  try {
    const result = await voice.hangupAll();
    console.log("Hang-up success:", result);
    res.json({ success: true, result });
  } catch (error) {
    console.error("Hang-up error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 SmartCall backend running on port ${PORT}`));
