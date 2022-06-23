import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  posts: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostMessage",
      },
    ],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);
export default User;
