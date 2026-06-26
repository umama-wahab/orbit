import express from "express";
import {
  updateProfile,
  updateTheme,
  searchUsers,
  getUserById,
  getContacts,
  addContact,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.put("/profile", updateProfile);
router.put("/theme", updateTheme);
router.get("/search", searchUsers);
router.get("/contacts", getContacts);
router.post("/contacts", addContact);
router.get("/:id", getUserById);

export default router;
