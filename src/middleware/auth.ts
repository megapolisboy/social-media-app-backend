import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || "";

    let decodedData: any;

    if (token) {
      decodedData = jwt.verify(token, "test");
      req.body.userId = decodedData?.id;
    }

    next();
  } catch (err) {
    console.log(err);
  }
};

export default auth;
