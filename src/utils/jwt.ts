import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { Types } from "mongoose";
import { SECRET } from "./env";

export interface IUserToken extends Omit<User, "password" | "isActivate" | "activationCode" | "email" | "fullName" | "profilePicture" | "username"> {
  id?: Types.ObjectId;
}

export const generateToken = (user: IUserToken): string => {
  const token = jwt.sign(user, SECRET as string, {
    expiresIn: "1h",
  });
  return token;
};

export const getUserData = (token: string): IUserToken => {
  const user = jwt.verify(token, SECRET as string) as IUserToken;
  return user;
};
