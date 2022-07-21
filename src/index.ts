import express from "express";
import cors from "cors";
import postsRoutes from "./routes/posts";
import userRoutes from "./routes/users";
import storiesRouter from "./routes/stories";
import "./mongoConfig";

const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());

app.use("/posts", postsRoutes);
app.use("/user", userRoutes);
app.use("/stories", storiesRouter);

app.use("/", (req, res) => res.send("App is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
