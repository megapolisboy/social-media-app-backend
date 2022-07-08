import express from "express";
import {} from "../controllers/posts";
import {
  signin,
  signinWithGoogle,
  signup,
  subscribe,
  unsubscribe,
} from "../controllers/user";
import auth from "../middleware/auth";

const router = express.Router();

router.post("/signin", signin);
router.post("/signin/google", signinWithGoogle);
router.post("/signup", signup);
router.patch("/subscribe/:id", auth, subscribe);
router.patch("/unsubscribe/:id", auth, unsubscribe);

export default router;
