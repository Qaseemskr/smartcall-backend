const express = require("express");
const africastalking = require("africastalking");
const cors = require("cors"); // Import CORS middleware

const app = express();

// 1. Setup CORS - IMPORTANT for frontend/backend communication
// Use environment variable for allowed origin or specify a list of allowed origins
// For development, we allow all (*), but in production, you should restrict this to your Netlify URL.
app.use(cors()); 

// Middleware to parse JSON requests
app.use(express.json());

// Initialize Africa's Talking with your credentials
// NOTE: For better security, these should ideally be loaded from environment variables (e.g., process.env.AT_API_KEY)
const at = africastalking({
  apiKey: "atsk_765307edb657c3e63dad04889136f3a3c3cbb691f3ed8e993e79235ce07258601f3dc22d",
  username: "SmartCall-Live",
});
const voice = at.VOICE;

// 2. The /startCall endpoint to initiate a real call
app.post("/startCall", async (req, res) => {
  // Check for the 'to' number in the request body
  const { to } = req.body;
  if (!to) {
    return res.status(400).json({ success: false, error: "The 'to' phone number is required." });
  }

  console.log(`Attempting to call: ${to}`);

  try {
    // You must use a valid and verified AT virtual number for callFrom
    const result = await voice.call({
      callFrom: "+2342017001172", // Your AT virtual number (MUST be verified)
      callTo: to,
    });
    
    // Log the successful result
    console.log("Call initiation successful:", result);
    res.json({ success: true, message: "Call initiated successfully.", result });
  } catch (e) {
    // Log the error
    console.error("Error initiating call with Africa's Talking:", e.message);
    // Respond with a 500 status and the error message
    res.status(500).json({ 
        success: false, 
        error: "Failed to initiate call.",
        details: e.message 
    });
  }
});

// Basic check route
app.get("/", (req, res) => {
    res.send("SmartCall Backend is running. Status: OK.");
});


// 3. Set up the server to listen on the correct port
// Use the port provided by the hosting environment (Render) or default to 5000
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`SmartCall Server running on port ${PORT}`);
});
