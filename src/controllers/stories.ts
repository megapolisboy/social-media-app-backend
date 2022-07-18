import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongoose";
import User from "../models/User";
import { filterStories } from "../utils/storiesHelper";

export const getStories = async (req: Request, res: Response) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  try {
    const currentUser = await User.findById(req.body.userId);
    const users = currentUser.subscriptions;
    const storyPromises = users.map(async (userId: ObjectId) => {
      const user = User.findById(userId.toString()).populate("stories");
      return user;
    });

    const stories = await Promise.all(storyPromises);
    const processedStories = stories.map((story: any) => ({
      userId: story._id,
      userName: story.name,
      userAvatar: story.picture,
      stories: story.stories,
    }));
    const filteredStories = filterStories(processedStories);
    return res.status(200).json(filteredStories);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
};
