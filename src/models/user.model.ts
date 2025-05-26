import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";

import { renderMailHtml, SendMail } from "../utils/mail/mail";
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";
import { ROLES } from "../utils/constant";

export const USER_MODEL_NAME = "User";

export interface User {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  profilePicture: string;
  isActivate: boolean;
  activationCode: string;
  createdAt?: string;
}

const Schema = mongoose.Schema;

const userSchema = new Schema<User>(
  {
    fullName: {
      type: Schema.Types.String,
      required: true,
    },
    username: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      enum: [ROLES.ADMIN, ROLES.MEMBER],
      default: ROLES.MEMBER,
    },
    profilePicture: {
      type: Schema.Types.String,
      default: "user.jpg",
    },
    isActivate: {
      type: Schema.Types.Boolean,
      default: false,
    },
    activationCode: {
      type: Schema.Types.String,
    },
  },
  { timestamps: true }
);

// Hash password before save (middleware)
userSchema.pre("save", function (next) {
  const user = this;
  user.password = encrypt(user.password);
  user.activationCode = encrypt(user.id);
  next();
});

userSchema.post("save", async function (doc, next) {
  try {
    const user = doc;

    console.log("Send Email to: ", user);

    const contentMail = await renderMailHtml("registration-success.ejs", {
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`,
    });

    await SendMail({
      from: EMAIL_SMTP_USER,
      to: user.email,
      subject: "Aktivasi Akun Anda",
      html: contentMail,
    });
  } catch (error) {
    console.log("error > ", error);
  } finally {
    next();
  }
});

// Hide password on toJSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const UserModel = mongoose.model<User>(USER_MODEL_NAME, userSchema);

export default UserModel;
