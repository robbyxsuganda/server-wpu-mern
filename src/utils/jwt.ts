import jwt from "jsonwebtoken";
import { SECRET } from "./env";
import { IUserToken } from "./interfaces";

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
