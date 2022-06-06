import express from "express";
import cors from "cors";
import postsRoutes from "./routes/posts";
// import "./mongoConfig";

const app = express();
app.use(express.json());

app.use("/posts", postsRoutes);
app.use(cors());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

export default app;
