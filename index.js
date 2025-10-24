const express = require("express");
const africastalking = require("africastalking");
const app = express();
app.use(express.json());
// This is needed for the webhook to correctly parse the data sent by AT
app.use(express.urlencoded({ extended: true })); 

// 🚨 CRITICAL: REPLACE THESE THREE LINES WITH YOUR ACTUAL PRIVATE CREDENTIALS! 🚨
const AT_API_KEY = "atsk_765307edb657c3e63dad04889136f3a3c7cbb691f3ed8e993e79235ce07258601f3dc22d"; // <-- REPLACE THIS WITH YOUR REAL API KEY
const AT_USERNAME = "SmartCall-Live"; // <-- REPLACE THIS WITH YOUR REAL USERNAME
const AT_VIRTUAL_NUMBER = "+2342017001172"; // <-- REPLACE WITH YOUR REAL AT VOICE NUMBER
// ✅ This is your live public URL from Render. It is correct.
const PUBLIC_URL = "https://smartcall-backend-7cm9.onrender.com"; 

const at = africastalking({
  apiKey: AT_API_KEY, 
  username: AT_USERNAME,
});
const voice = at.VOICE;

// We need this to send back in the XML response. 
const callCostPerMinute = 13; 


// Endpoint to initiate the call from the frontend
app.post("/startCall", async (req, res) => {
  try {
    const { to } = req.body;
    
    // Validate number format (e.g., must start with +)
    if (!to || !to.startsWith('+')) {
        return res.status(400).json({ success: false, error: "Invalid recipient number format. Must include country code (e.g., +234...)" });
    }

    const result = await voice.call({
      callFrom: AT_VIRTUAL_NUMBER, // Your AT virtual number (Source of call)
      callTo: to,
      // The callbackUrl tells AT where to send call events (to your public webhook)
      callbackUrl: `${PUBLIC_URL}/at-voice-webhook`,
    });

    console.log("Call initiated successfully:", result);
    res.json({ success: true, result });
  } catch (e) {
    console.error("Error initiating call:", e.message);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Webhook Endpoint for Africa's Talking Call Events
// This is mandatory for the call flow to work.
app.post("/at-voice-webhook", (req, res) => {
    // The request body contains call information (e.g., isActive, callerNumber, destinationNumber)
    const isActive = req.body.isActive;
    const direction = req.body.direction;

    console.log("Webhook Received:", req.body);

    if (isActive === '1' && direction === 'Outbound') {
        // This XML tells Africa's Talking what to say to the recipient when they answer.
        const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say playBeep="true" voice="woman">
        Thank you for calling SmartCall. Your call to ${req.body.destinationNumber} is now connecting. 
        Please note that this call is charged at ${callCostPerMinute} Naira per minute.
    </Say>
</Response>`;
        res.status(200).send(response);
    } else if (isActive === '0') {
        // Call has ended. You would update your Firestore history here.
        console.log(`Call ended. Duration: ${req.body.durationInSeconds} seconds. Status: ${req.body.status}`);
        res.status(200).send();
    } else {
        // Default response for other states
        res.status(200).send('<Response><Say>Goodbye.</Say></Response>');
    }
});


app.listen(10000, () => console.log("SmartCall Backend Server running on port 10000"));
