import express from "express";
import { chatWithBot } from "../controllers/chatbotController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// router.post("/", protect, chatWithBot);
router.post("/", chatWithBot);
export default router;