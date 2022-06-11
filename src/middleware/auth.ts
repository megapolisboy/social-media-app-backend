import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || "";
    const isCurtomAuth = token.length < 500;

    let decodedData: any;

    if (token && isCurtomAuth) {
      decodedData = jwt.verify(token, "test");
      req.body.userId = decodedData?.id;
    } else {
      decodedData = jwt.decode(token);
      req.body.userId = decodedData?.sub;
    }

    next();
  } catch (err) {
    console.log(err);
  }
};

export default auth;
