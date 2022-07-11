import express from "express";
import {} from "../controllers/posts";
import {
  getAllUsers,
  getUser,
  signin,
  signinWithGoogle,
  signup,
  subscribe,
} from "../controllers/user";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/signin", signin);
router.post("/signin/google", signinWithGoogle);
router.post("/signup", signup);
router.patch("/subscribe/:id", auth, subscribe);
router.get("/:search?", auth, getAllUsers);
router.get("/id/:id", auth, getUser);

export default router;
