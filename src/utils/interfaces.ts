import { Types } from "mongoose";
import { User } from "../models/user.model";
import { Request } from "express";

export interface IReqUser extends Request {
  user?: IUserToken;
}

export interface IUserToken
  extends Omit<
    User,
    | "password"
    | "isActivate"
    | "activationCode"
    | "email"
    | "fullName"
    | "profilePicture"
    | "username"
  > {
  id?: Types.ObjectId;
}
