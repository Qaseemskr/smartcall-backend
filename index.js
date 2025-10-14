const express = require("express");
const africastalking = require("africastalking");
const app = express();
app.use(express.json());

const at = africastalking({
  apiKey: "atsk_765307edb657c3e63dad04889136f3a3c7cbb691f3ed8e993e79235ce07258601f3dc22d",
  username: "SmartCall-Live",
});
const voice = at.VOICE;

app.post("/startCall", async (req, res) => {
  try {
    const { to } = req.body;
    const result = await voice.call({
      callFrom: "+2342017001172", // your AT virtual number
      callTo: to,
    });
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(10000, () => console.log("Server running"));
