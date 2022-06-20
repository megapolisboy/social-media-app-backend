import mongoose from "mongoose";

const googleUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  picture: { type: String, required: false },
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

const GoogleUser = mongoose.model("GoogleUser", googleUserSchema);
export default GoogleUser;
