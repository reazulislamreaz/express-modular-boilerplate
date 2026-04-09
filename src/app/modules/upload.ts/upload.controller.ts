import { Request, Response } from "express";
import * as UploadService from "./upload.service";
import catchAsync from "../../utils/catch_async";
import { AppError } from "../../utils/app_error";
import httpStatus from "http-status";
import manageResponse from "../../utils/manage_response";




/* 

single file
field name = file

field name = files
max files = 10

*/
export const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const file = req.file as Express.Multer.File;

  if (file) {
    const url = await UploadService.uploadSingleFile(file);
    manageResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "File uploaded successfully",
      data: { url },
    });
    return;
  }

  if (files && files.length > 0) {
    const urls = await UploadService.uploadMultipleFiles(files);
    manageResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Files uploaded successfully",
      data: { urls },
    });
    return;
  }

  throw new AppError("No file uploaded", httpStatus.BAD_REQUEST);
});