import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { app, server } from "./lib/socket.js";
import path from "path";
import Story from "./models/story.model.js";
import cron from "node-cron"; 

dotenv.config();
const PORT = process.env.PORT;
const __dirname = path.resolve();

// Middleware setup
app.use(cookieParser());
app.use(express.json({ limit: '10mb' })); // For JSON payloads
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Routes setup
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Cron job to delete expired stories every hour
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const expiredStories = await Story.deleteMany({ storyExpiry: { $lt: now } });
    console.log(`${expiredStories.deletedCount} expired story(ies) deleted.`);
  } catch (error) {
    console.error("Error deleting expired stories:", error);
  }
});

// Start server
server.listen(PORT, async () => {
  await connectDB();
  console.log("Server is running on port:" + PORT);
});
