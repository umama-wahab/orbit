import express from "express";
import { createPoll, votePoll, getPoll, closePoll } from "../controllers/pollController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createPoll);
router.get("/:id", getPoll);
router.post("/:id/vote", votePoll);
router.post("/:id/close", closePoll);

export default router;
