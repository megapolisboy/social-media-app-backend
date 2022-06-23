import { Request, Response } from "express";
import mongoose, { ObjectId } from "mongoose";
import Comment from "../models/Comment";
import PostMessage from "../models/PostMessage";
import User from "../models/User";
export const getPosts = async (req: Request, res: Response) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  try {
    const postMessages = await PostMessage.find()
      .populate("creator")
      .populate("likes")
      .populate("comments");
    res.status(200).json(postMessages);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};

export const createPost = async (req: Request, res: Response) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  const creator = req.body.userId;
  const { title, message, tags, selectedFile, createdAt } = req.body;

  // creator is user's ID
  const post = {
    title,
    message,
    creator,
    tags,
    selectedFile,
    createdAt,
  };

  const newPost = new PostMessage(post);
  try {
    const createdPost = await newPost.save();
    const dbuser = await User.findById(creator);
    dbuser.posts.push(createdPost._id);
    await dbuser.save();

    res.status(201).json(newPost);
  } catch (err: any) {
    res.status(409).json({ message: err.message });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  const { id: _id } = req.params;
  const post = req.body;
  delete post.userId;
  try {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(404).send("No posts with this id");
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
      new: true,
    });

    res.json(updatedPost);
  } catch (err: any) {
    res.status(409).json({ message: err.message });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  const creator = req.body.userId;

  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }
  try {
    await PostMessage.findByIdAndRemove(_id);

    const dbuser = await User.findById(creator);
    dbuser.posts = dbuser.posts.filter(
      (post: any) => post._id.toString() !== _id
    );
    console.log(dbuser);
    await dbuser.save();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err: any) {
    res.status(409).json({ message: err.message });
  }
};

export const likePost = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!req.body.userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }

  try {
    const post = await PostMessage.findById(_id);

    const index = post.likes.findIndex(
      (id: ObjectId) => id.toString() === req.body.userId
    );
    if (index == -1) {
      post.likes.push(req.body.userId);
    } else {
      post.likes = post.likes.filter(
        (id: ObjectId) => id.toString() !== req.body.userId
      );
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
      new: true,
    });

    res.status(200).json(updatedPost);
  } catch (err: any) {
    res.status(409).json({ message: err.message });
  }
};

export const addComment = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!req.body.userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }

  const { message, createdAt } = req.body;

  try {
    const createdComment = await Comment.create({
      message,
      createdAt,
      creator: req.body.userId,
      post: _id,
    });

    const post = await PostMessage.findById(_id);
    post.comments.push(createdComment._id);
    await PostMessage.findByIdAndUpdate(_id, post, { new: true });

    res.status(200).json(createdComment);
  } catch (err: any) {
    res.status(409).json({ message: err.message });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!req.body.userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No comment with this id");
  }

  const message = req.body.message as string;

  const comment = await Comment.findById(_id);

  const updatedComment = await Comment.findByIdAndUpdate(
    _id,
    { message },
    { new: true }
  );

  res.status(201).json(updatedComment);
};

export const deleteComment = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!req.body.userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }

  const comment = await Comment.findById(_id);
  const postId = comment.post;

  await Comment.findByIdAndDelete(_id);

  const post = await PostMessage.findById(postId);
  post.comments = post.comments.filter(
    (commentId: ObjectId) => commentId.toString() !== _id
  );
  await PostMessage.findByIdAndUpdate(postId, post, { new: true });

  res.status(200).json({ message: "Comment deleted successfully" });
};

export const likeComment = async (req: Request, res: Response) => {
  const { id: _id } = req.params;

  if (!req.body.userId) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No posts with this id");
  }

  const comment = await Comment.findById(_id);

  const index = comment.likes.findIndex(
    (id: ObjectId) => id.toString() === req.body.userId
  );
  if (index == -1) {
    comment.likes.push(req.body.userId);
  } else {
    comment.likes = comment.likes.filter(
      (id: ObjectId) => id.toString() !== req.body.userId
    );
  }
  const updatedComment = await Comment.findByIdAndUpdate(_id, comment, {
    new: true,
  });

  res.status(200).json(updatedComment);
};
