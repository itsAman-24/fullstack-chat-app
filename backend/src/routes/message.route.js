import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();
import {getUsersForSidebar, getMessages, sendMessage, uploadStory, getStories} from "../controllers/message.controller.js"

router.get("/users", protectRoute, getUsersForSidebar);
router.get('/stories', getStories);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put('/upload-story', protectRoute, uploadStory);

export default router;