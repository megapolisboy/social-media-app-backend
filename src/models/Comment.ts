import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  message: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PostMessage",
  },
  likes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
