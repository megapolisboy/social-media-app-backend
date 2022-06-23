import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  message: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tags: [String],
  selectedFile: String,
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
  comments: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    default: [],
  },
});

const PostMessage = mongoose.model("PostMessage", postSchema);
export default PostMessage;
