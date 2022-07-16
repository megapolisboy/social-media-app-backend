import { NextFunction, Request, Response } from "express";
import mongoose, { ObjectId } from "mongoose";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import Story from "../models/Story";

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });

  const user = await User.findById(req.body.userId)
    .populate("subscribers")
    .populate("subscriptions")
    .populate("posts")
    .populate("stories");

  res.status(200).json({ result: user });
};

export const signin = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  try {
    const existingUser = await User.findOne({ email })
      .populate("subscribers")
      .populate("subscriptions")
      .populate("posts")
      .populate("stories");

    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist." });
    }
    if (existingUser && !existingUser.isPassword) {
      return res.status(404).json({ message: "User doesn't exist." });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "test",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signup = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  const confirmPassword: string = req.body.confirmPassword;
  const firstName: string = req.body.firstName;
  const lastName: string = req.body.lastName;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isPassword) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let result;
    if (!existingUser) {
      result = await User.create({
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        isGoogle: false,
        isPassword: true,
      });
    } else if (existingUser && existingUser.isGoogle) {
      await User.updateOne(
        { email: existingUser.email },
        {
          password: hashedPassword,
          isPassword: true,
        }
      );
      result = await User.findOne({ email: existingUser.email })
        .populate("subscribers")
        .populate("subscriptions")
        .populate("posts")
        .populate("stories");
      console.log(result);
    }

    const token = jwt.sign({ email: result.email, id: result._id }, "test", {
      expiresIn: "1h",
    });

    res.status(200).json({ result, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signinWithGoogle = async (req: Request, res: Response) => {
  const token = req.body.token as string;
  const clientId =
    "44100760713-cf7f064j9uvj7q07cq76ilo3qmhp8ukn.apps.googleusercontent.com";

  const client = new OAuth2Client(clientId);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const name = payload?.name;
    const email = payload?.email;
    const picture = payload?.picture;

    const googleUser = { name, email, picture, isGoogle: true };

    let existingUser = await User.findOne({ email });
    if (!existingUser) {
      await User.create({ ...googleUser, isPassword: false });
    } else if (existingUser && !existingUser.isGoogle) {
      await User.updateOne(
        { email: existingUser.email },
        {
          isGoogle: true,
          picture,
        }
      );
    }
    existingUser = await User.findOne({ email })
      .populate("subscribers")
      .populate("subscriptions")
      .populate("posts")
      .populate("stories");

    const jwtToken = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "test",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ result: existingUser, token: jwtToken });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  const { id: _id } = req.params;
  console.log("started");

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No user with this id");
  }
  try {
    const currentUser = await User.findById(req.body.userId);
    const followUser = await User.findById(_id);

    const index = currentUser.subscriptions.findIndex(
      (subscription: ObjectId) => subscription.toString() === _id
    );

    let action;

    if (index === -1) {
      currentUser.subscriptions.push(_id);
      followUser.subscribers.push(req.body.userId);
      action = "subscribe";
    } else {
      currentUser.subscriptions = currentUser.subscriptions.filter(
        (subscription: ObjectId) => subscription.toString() !== _id
      );
      followUser.subscribers = followUser.subscribers.filter(
        (subscriber: ObjectId) => subscriber.toString() !== req.body.userId
      );
      action = "unsubscribe";
    }

    currentUser.save();
    followUser.save();

    const newUser = await User.findById(_id);
    res.status(200).send({ action, user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { search } = req.params;
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });

  try {
    const exp = new RegExp(search, "i");
    const users = await User.find({ name: exp })
      .limit(20)
      .populate("subscribers")
      .populate("subscriptions")
      .populate("posts")
      .populate("stories");
    users.map((user) =>
      user.stories.filter(
        (story: any) => new Date().getTime() - story.createdAt.getTime() < 86400
      )
    );
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: _id } = req.params;
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("No user with this id");
  }
  try {
    const user = await User.findById(_id)
      .populate("subscribers")
      .populate("subscriptions")
      .populate("posts");
    console.log(user);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const addStory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  const story = req.body.story as string;
  const user = await User.findById(req.body.userId);
  const savedStory = await Story.create({
    creator: req.body.userId,
    createdAt: new Date(),
    post: story,
  });
  user.stories.push(savedStory._id);
  await user.save();
  res.status(201).json(savedStory);
};
