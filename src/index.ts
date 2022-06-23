import express from "express";
import cors from "cors";
import postsRoutes from "./routes/posts";
import userRoutes from "./routes/users";
import "./mongoConfig";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/posts", postsRoutes);
app.use("/user", userRoutes);

app.use("/", (req, res) => res.send("App is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
