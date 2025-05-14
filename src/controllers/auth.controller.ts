import { Request, Response } from "express";
import * as yup from "yup";

import UserModel from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

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
    .test(
      "at-least-one-uppercase-letter",
      "Contains at least one uppercase letter",
      (value) => {
        if (!value) return false;
        const regex = /^(?=.*[A-Z])/;
        return regex.test(value);
      }
    )
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
    const { fullName, username, email, password, confirmPassword } =
      req.body as unknown as TRegister;

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

      response.success(res, result, "Registration Success");
    } catch (error) {
      response.error(res, error, "Registration Failed");
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
        return response.unauthoried(res, "User Not Found");
      }

      const validatePassword: boolean =
        encrypt(password) === userByIdentifier.password;

      if (!validatePassword) {
        return response.unauthoried(res, "User Not Found");
      }

      const token = generateToken({
        id: userByIdentifier._id,
        role: userByIdentifier.role,
      });

      response.success(res, token, "Login Success");
    } catch (error) {
      response.error(res, error, "Login Failed");
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

      response.success(res, result, "Success Get Profile");
    } catch (error) {
      response.error(res, error, "Failed Get Profile");
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

      response.success(res, user, "User Successfully Activated");
    } catch (error) {
      response.error(res, error, "Activation Failed");
    }
  },
};
