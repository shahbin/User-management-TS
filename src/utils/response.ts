import { Response } from "express";
import { IApiResponse } from "../dtos/user.dto";
import { AppError } from "./errors";

export class ResponseHandler {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200
  ): void {
    const response: IApiResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
    };
    res.status(statusCode).json(response);
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = "Success",
    statusCode: number = 200
  ): void {
    const totalPages = Math.ceil(total / limit);
    const response = {
      success: true,
      statusCode,
      message,
      data: {
        items: data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    };
    res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    error: AppError | Error,
    statusCode?: number
  ): void {
    if (error instanceof AppError) {
      const response: IApiResponse<null> = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: (error as any).errors,
      };
      res.status(error.statusCode).json(response);
    } else {
      const response: IApiResponse<null> = {
        success: false,
        statusCode: statusCode || 500,
        message: error.message || "Internal server error",
      };
      res.status(statusCode || 500).json(response);
    }
  }
}
