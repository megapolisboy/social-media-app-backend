import express from "express";
import multer from "multer";
import {} from "../controllers/posts";
import {
  addStory,
  getAllUsers,
  getCurrentUser,
  getUser,
  signin,
  signinWithGoogle,
  signup,
  subscribe,
} from "../controllers/user";
import auth from "../middleware/auth";
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.post("/signin", signin);
router.post("/signin/google", signinWithGoogle);
router.post("/signup", signup);
router.patch("/subscribe/:id", auth, subscribe);
router.get("/current", auth, getCurrentUser);
router.get("/:search?", auth, getAllUsers);
router.get("/id/:id", auth, getUser);
router.post("/story", upload.single("story"), auth, addStory);

export default router;
