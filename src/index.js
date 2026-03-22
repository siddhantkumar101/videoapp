import dotenv from "dotenv";

// ✅ Load env FIRST (before anything else)
dotenv.config({ path: "./.env" });

import connectDB from "./db/db.js";
import { app } from "./app.js";

// ✅ Debug (optional - remove later)
// console.log("ENV CHECK:", {
//   cloudName: process.env.CLOUDINARY_CLOUD_NAME,
//   apiKey: process.env.CLOUDINARY_API_KEY,
// });

// ✅ Connect DB FIRST, then start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });