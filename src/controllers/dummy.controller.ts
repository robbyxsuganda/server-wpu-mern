import { Response } from "express";
import response from "../utils/response";

export default {
  dummy(res: Response) {
    response.success(res, "Test", "Masukk");
  },
};
