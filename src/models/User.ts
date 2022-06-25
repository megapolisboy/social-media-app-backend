import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: String,
  picture: String,
  posts: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PostMessage",
      },
    ],
    default: [],
  },
  isGoogle: { type: Boolean, default: false },
  isPassword: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);
export default User;
