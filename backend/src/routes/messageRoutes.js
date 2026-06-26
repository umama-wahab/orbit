import express from "express";
import {
  sendMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  markAsRead,
} from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", sendMessage);
router.put("/:id", editMessage);
router.delete("/:id", deleteMessage);
router.post("/:id/react", reactToMessage);
router.post("/read", markAsRead);

export default router;
