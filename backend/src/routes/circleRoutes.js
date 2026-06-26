import express from "express";
import {
  createCircle,
  joinCircle,
  getMyCircles,
  getCircleById,
  leaveCircle,
  getTrendingCircles,
  getCircleMessages,
} from "../controllers/circleController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/", createCircle);
router.post("/join", joinCircle);
router.get("/", getMyCircles);
router.get("/trending", getTrendingCircles);
router.get("/:id", getCircleById);
router.post("/:id/leave", leaveCircle);
router.get("/:id/messages", getCircleMessages);

export default router;
