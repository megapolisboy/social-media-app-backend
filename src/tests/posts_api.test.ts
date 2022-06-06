import mongoose from "mongoose";
import supertest from "supertest";
import app from "../index";
import PostMessage from "../models/PostMessage";
import { initializeMongoServer } from "../mongoConfigTesting";

const api = supertest(app);

const initialPosts = [
  {
    title: "First post",
    message: "this is ma first post",
    creator: "Jack",
    tags: ["abc", "bca", "cab"],
    selectedFile: "File",
  },
  {
    title: "Second post",
    message: "this is ma second post",
    creator: "Jack",
    tags: ["abc", "bca", "cab"],
    selectedFile: "File",
  },
  {
    title: "Third post",
    message: "this is ma third post",
    creator: "Jack",
    tags: ["abc", "bca", "cab"],
    selectedFile: "File",
  },
];

describe("posts operations tests", () => {
  beforeAll(async () => {
    await initializeMongoServer();
  });

  beforeEach(async () => {
    await PostMessage.deleteMany({});
    let postObject = new PostMessage(initialPosts[0]);
    await postObject.save();
    postObject = new PostMessage(initialPosts[1]);
    await postObject.save();
    postObject = new PostMessage(initialPosts[2]);
    await postObject.save();
  });

  test("posts are returned as json", async () => {
    const response = await api
      .get("/posts")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body).toHaveLength(initialPosts.length);
  });

  test("posts are added correctly", async () => {
    const post = {
      title: "First post",
      message: "this is ma first post",
      creator: "Jack",
      tags: ["abc", "bca", "cab"],
      selectedFile: "File",
    };

    await api.post("/posts").send(post);
    const response = await api.get("/posts");

    expect(response.body).toHaveLength(initialPosts.length + 1);
  });

  test("posts are deleted correctly", async () => {
    let response = await api.get("/posts");
    const id = response.body[0]._id;
    await api.delete("/posts/" + id);
    response = await api.get("/posts");
    expect(response.body).toHaveLength(initialPosts.length - 1);
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
