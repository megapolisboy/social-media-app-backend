import { Request, Response } from "express";
import mongoose from "mongoose";
import PostMessage from "../models/PostMessage";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const postMessages = await PostMessage.find();
    res.status(200).json(postMessages);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const createPost = async (req: Request, res: Response) => {
  const post = req.body;

  const newPost = new PostMessage(post);
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err: any) {
    res.status(409).json({ message: err.message });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  const { id: _id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }
  const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });

  res.json(updatedPost);
};

export const deletePost = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }
  await PostMessage.findByIdAndRemove(_id);

  res.json({ message: "Post deleted successfully" });
};

export const likePost = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!req.body.userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }

  const post = await PostMessage.findById(_id);

  const index = post.likes.findIndex(
    (id: string) => id === String(req.body.userId)
  );
  if (index == -1) {
    post.likes.push(req.body.userId);
  } else {
    post.likes = post.likes.filter(
      (id: string) => id !== String(req.body.userId)
    );
  }
  const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });

  res.json(updatedPost);
};
