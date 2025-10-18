// --- SmartCall Backend ---
const express = require("express");
const cors = require("cors");
const africastalking = require("africastalking");

// express setup
const app = express();
app.use(cors());
app.use(express.json());

// --- Africa's Talking Setup ---
const at = africastalking({
  apiKey: "atsk_765307edb657c3e63dad04889136f3a3c7cbb691f3ed8e993e79235ce07258601f3dc22d",
  username: "SmartCall-Live"
});
const voice = at.VOICE;

// --- Home route (for testing) ---
app.get("/", (req, res) => {
  res.send("✅ SmartCall backend is running");
});

// --- Call route ---
app.post("/startCall", async (req, res) => {
  const { to } = req.body;
  if (!to) return res.json({ success: false, error: "Missing number" });

  try {
    const response = await voice.call({
      callFrom: "+2342017001172", // your AT virtual number
      callTo: [to],
    });

    console.log("Call success:", response);
    res.json({ success: true, response });
  } catch (error) {
    console.error("Call error:", error);
    res.json({ success: false, error: error.message || "Unknown error" });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port", PORT));

