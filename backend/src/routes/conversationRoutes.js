import express from "express";
import {
  getConversations,
  createPrivateConversation,
  createGroup,
  updateGroup,
  addGroupMembers,
  makeGroupAdmin,
  getMessages,
  searchMessages,
} from "../controllers/conversationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getConversations);
router.post("/private", createPrivateConversation);
router.post("/group", createGroup);
router.put("/group/:id", updateGroup);
router.post("/group/:id/members", addGroupMembers);
router.post("/group/:id/admins", makeGroupAdmin);
router.get("/:id/messages", getMessages);
router.get("/:id/messages/search", searchMessages);

export default router;
