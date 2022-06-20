import express from "express";
import {} from "../controllers/posts";
import { signin, signinWithGoogle, signup } from "../controllers/user";

const router = express.Router();

router.post("/signin", signin);
router.post("/signin/google", signinWithGoogle);
router.post("/signup", signup);

export default router;
