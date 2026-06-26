import express from "express";
import {
  createConfession,
  getConfessions,
  likeConfession,
  reportConfession,
  getComments,
  addComment,
} from "../controllers/confessionController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createConfession);
router.get("/", getConfessions);
router.post("/:id/like", likeConfession);
router.post("/:id/report", reportConfession);
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);

export default router;
