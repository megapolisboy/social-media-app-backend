import mongoose from "mongoose";

const CONNECTION_URL =
  "mongodb+srv://nodercoder:TVJwgwEbfHbn3MgY@cluster0.kpebu.mongodb.net/social-media-app?retryWrites=true&w=majority";

mongoose.connect(CONNECTION_URL);
