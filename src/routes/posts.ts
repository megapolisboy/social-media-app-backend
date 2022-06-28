import express from "express";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  getCurrentUserPosts,
} from "../controllers/posts";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.get("/", getPosts);
router.get("/currentUserPosts", getCurrentUserPosts);
router.post("/", createPost);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);
router.patch("/:id/likePost", likePost);
router.post("/:id/comment", addComment);
router.patch("/comment/:id", updateComment);
router.delete("/comment/:id", deleteComment);
router.patch("/comment/:id/likeComment", likeComment);

export default router;
