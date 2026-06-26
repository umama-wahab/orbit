import express from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.put("/:id/read", markNotificationRead);
router.put("/read-all", markAllNotificationsRead);
router.delete("/:id", deleteNotification);

export default router;
