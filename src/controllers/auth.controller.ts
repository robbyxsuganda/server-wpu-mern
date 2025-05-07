import { Request, Response } from "express";
import * as yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../middlewares/auth.middleware";

type TRegister = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type TLogin = {
  identifier: string;
  password: string;
};

const registerSchema = yup.object({
  fullName: yup.string().required(),
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup
    .string()
    .required()
    .min(6, "Password must be at least 8 characters")
    .test("at-least-one-uppercase-letter", "Contains at least one uppercase letter", (value) => {
      if (!value) return false;
      const regex = /^(?=.*[A-Z])/;
      return regex.test(value);
    })
    .test("at-least-one-number", "Contains at least one number", (value) => {
      if (!value) return false;
      const regex = /^(?=.*\d)/;
      return regex.test(value);
    }),
  confirmPassword: yup
    .string()
    .required()
    .oneOf([yup.ref("password")], "Password must match"),
});

export default {
  async register(req: Request, res: Response) {
    /**
      #swagger.tags = ["Auth"]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/RegisterRequest"
        }
     }
     */
    const { fullName, username, email, password, confirmPassword } = req.body as unknown as TRegister;

    try {
      await registerSchema.validate({
        fullName,
        username,
        email,
        password,
        confirmPassword,
      });

      const result = await UserModel.create({
        fullName,
        username,
        email,
        password,
      });

      res.status(201).json({ message: "Success Registration", data: result });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },

  async login(req: Request, res: Response) {
    /**
      #swagger.tags = ["Auth"]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/LoginRequest"
        }
     }
     */
    const { identifier, password } = req.body as unknown as TLogin;
    // console.log(identifier, password, "<<<<<<<<ini login");

    try {
      const userByIdentifier = await UserModel.findOne({
        $or: [{ username: identifier }, { email: identifier }],
        isActivate: true,
      });

      // console.log(userByIdentifier, "<<<<<<<<ini userByIdentifier");

      if (!userByIdentifier) {
        return res.status(403).json({ message: "User not Found", data: null });
      }

      const validatePassword: boolean = encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return res.status(403).json({ message: "User Not Found", data: null });
      }

      const token = generateToken({ id: userByIdentifier._id, role: userByIdentifier.role });

      res.status(200).json({ message: "Success Login", data: token });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },

  async me(req: IReqUser, res: Response) {
    /**
      #swagger.tags = ["Auth"]
      #swagger.security = [{
        "bearerAuth": []
      }]
     */
    try {
      // console.log(req, "<<<<<<<<ini req.user");
      const user = req.user;
      const result = await UserModel.findById(user?.id);

      res.status(200).json({ message: "Success Get Profile", data: result });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },

  async activation(req: Request, res: Response) {
    /**
      #swagger.tags = ["Auth"]
      #swagger.requestBody = {
        required: true,
        schema: {
          $ref: "#/components/schemas/ActivationRequest"
        }
     }
     */
    try {
      const { code } = req.body as { code: string };

      const user = await UserModel.findOneAndUpdate(
        {
          activationCode: code,
        },
        {
          isActivate: true,
        },
        {
          new: true, // return the updated document
        }
      );

      res.status(200).json({
        message: "User Successfully activated",
        data: user,
      });
    } catch (error) {
      const err = error as unknown as Error;
      res.status(400).json({ message: err.message, data: null });
    }
  },
};
