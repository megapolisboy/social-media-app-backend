import express from "express";
import {} from "../controllers/posts";
import { getStories } from "../controllers/stories";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/", auth, getStories);

export default router;
