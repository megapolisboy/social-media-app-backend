import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import postsRoutes from "./routes/posts";

const app = express();

app.use("/posts", postsRoutes);
app.use(cors());

const CONNECTION_URL =
  "mongodb+srv://nodercoder:TVJwgwEbfHbn3MgY@cluster0.kpebu.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URL)
  .then(() =>
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
  )
  .catch((err) => console.log(err.message));
