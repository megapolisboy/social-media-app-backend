import { NextFunction, Request, Response } from "express";
import mongoose, { ObjectId } from "mongoose";
import Comment from "../models/Comment";
import PostMessage from "../models/PostMessage";
import User from "../models/User";
import cloudinary from "../utils/cloudinary";
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

export const getCurrentUserPosts = async (req: Request, res: Response) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  try {
    const postMessages = await PostMessage.find({ creator: req.body.userId })
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
  const { title, message, tags, createdAt } = req.body;

  // creator is user's ID
  const post = {
    title,
    message,
    creator,
    tags,
    createdAt,
  };

  try {
    const createdPost = await PostMessage.create(post);
    createdPost.populate("creator");
    createdPost.populate("likes");
    createdPost.populate("comments");

    const dbuser = await User.findById(creator);
    dbuser.posts.push(createdPost._id);
    await dbuser.save();

    res.status(201).json(createdPost);
  } catch (err: any) {
    res.status(409).json({ message: err.message });
  }
};

export const addImageToPost = async (req: Request, res: Response) => {
  const { id: _id } = req.params;
  const uploadResponse = await cloudinary.uploader.upload(req.file?.path || "");

  const post = await PostMessage.findByIdAndUpdate(
    _id,
    {
      selectedFile: uploadResponse.url,
    },
    { new: true }
  )
    .populate("creator")
    .populate("likes")
    .populate("comments");

  res.status(201).json(post);
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
    })
      .populate("creator")
      .populate("likes")
      .populate("comments");

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
    const post = await PostMessage.findById(_id);
    if (post.creator.toString() !== creator) {
      return res
        .status(403)
        .json({ message: "Only creator can delete this post" });
    }
    await PostMessage.findByIdAndRemove(_id);

    const dbuser = await User.findById(creator);
    dbuser.posts = dbuser.posts.filter(
      (post: any) => post._id.toString() !== _id
    );
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
    })
      .populate("creator")
      .populate("likes")
      .populate("comments");

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

  const { message } = req.body;

  try {
    const createdComment = await Comment.create({
      message,
      createdAt: new Date(),
      creator: req.body.userId,
      post: _id,
    });
    createdComment.populate("creator");

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

export const getPostComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });

  try {
    const { id } = req.params;
    const comments = await Comment.find({ post: id }).populate("creator");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
