import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

export const signin = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  try {
    const existingUser = await User.findOne({ email })
      .populate("subscribers")
      .populate("subscriptions")
      .populate("posts");

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
        .populate("posts");
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
      .populate("posts");

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

    const id = currentUser.subscriptions.find(
      (subscription: string) => subscription === _id
    );

    let action;

    if (!id) {
      currentUser.subscriptions.push(_id);
      followUser.subscribers.push(req.body.userId);
      action = "subscribe";
    } else {
      currentUser.subscriptions = currentUser.subscriptions.filter(
        (subscription: string) => subscription !== _id
      );
      followUser.subscribers = followUser.subscribers.filter(
        (subscription: string) => subscription !== req.body.userId
      );
      action = "unsubscribe";
    }

    currentUser.save();
    followUser.save();

    const newUser = await User.findById(_id);
    res.status(200).send({ action, user: followUser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.userId)
    return res.status(401).json({ message: "Unauthenticated" });
  try {
    const users = await User.find({})
      .populate("subscribers")
      .populate("subscriptions")
      .populate("posts");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
