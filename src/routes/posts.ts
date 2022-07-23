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
  addImageToPost,
  getPostComments,
} from "../controllers/posts";
import auth from "../middleware/auth";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.use(auth);

router.get("/", getPosts);
router.get("/currentUserPosts", getCurrentUserPosts);
router.post("/", createPost);
router.put("/:id/image", upload.single("selectedFile"), addImageToPost);
router.patch("/:id", updatePost);
router.delete("/:id", deletePost);
router.patch("/:id/likePost", likePost);
router.post("/:id/comment", addComment);
router.patch("/comment/:id", updateComment);
router.delete("/comment/:id", deleteComment);
router.patch("/comment/:id/likeComment", likeComment);
router.get("/:id/comments", getPostComments);

export default router;
