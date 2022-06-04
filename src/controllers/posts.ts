import { Request, Response } from "express";
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
  console.log("POST UPDATED");
};

export const deletePost = async (req: Request, res: Response) => {
  console.log("POST DELETED");
};
