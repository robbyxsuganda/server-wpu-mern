import { Response } from "express";
import { IReqUser } from "../utils/interfaces";
import uploader from "../utils/uploader";
import response from "../utils/response";

export default {
  async single(req: IReqUser, res: Response) {
    if (!req.file) {
      response.error(res, null, "File is not exists");
    }

    try {
      const result = await uploader.uploadSingle(
        req.file as Express.Multer.File
      );
      response.success(res, result, "Success Uploading File");
    } catch (error) {
      response.error(res, error, "Error Uploading File");
    }
  },
  async multiple(req: IReqUser, res: Response) {
    if (!req.files || req.files.length === 0) {
      response.error(res, null, "Files is not exists");
    }

    try {
      const result = await uploader.uploadMultiple(
        req.files as Express.Multer.File[]
      );
      response.success(res, result, "Success Uploading Files");
    } catch (error) {
      response.error(res, error, "Error Uploading Files");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { fileUrl } = req.body as { fileUrl: string };
      const result = await uploader.remove(fileUrl);
      response.success(res, result, "Success Removing Files");
    } catch (error) {
      response.error(res, error, "Error Removing Files");
    }
  },
};
