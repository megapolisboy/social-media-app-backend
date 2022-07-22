import express from "express";
import cors from "cors";
import postsRoutes from "./routes/posts";
import userRoutes from "./routes/users";
import storiesRouter from "./routes/stories";
import "./mongoConfig";
import path from "path";
require("dotenv").config();

const app = express();
app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/posts", postsRoutes);
app.use("/user", userRoutes);
app.use("/stories", storiesRouter);

app.use("/", (req, res) => res.send("App is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
