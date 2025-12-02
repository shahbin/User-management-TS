import { Request, Response, NextFunction } from "express";
import { IUserService } from "../services/IUserService";
import { IUserRegisterRequest, IUserLoginRequest } from "../dtos/user.dto";
import { ResponseHandler } from "../utils/response";
import { AppError } from "../utils/errors";

export class AuthController {
  constructor(private userService: IUserService) {}

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const registerRequest: IUserRegisterRequest = {
        name,
        email,
        password,
      };

      const user = await this.userService.registerUser(registerRequest);
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const acceptHeader = (req.headers.accept || "").toString();
      const wantsJson = acceptHeader.includes("application/json") || req.xhr;

      if (wantsJson) {
        ResponseHandler.success(res, user, "Registration successful! Welcome 👋", 201);
      } else {
        res.redirect("/home");
      }
    } catch (error: any) {
      const acceptHeader = (req.headers.accept || "").toString();
      const wantsJson = acceptHeader.includes("application/json") || req.xhr;

      if (wantsJson) {
        next(error);
      } else {
        const errorMessage = error.message || "Registration failed";
        res.render("user/register", { error: errorMessage });
      }
    }
  };


  loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const loginRequest: IUserLoginRequest = {
        email,
        password,
      };

      const user = await this.userService.loginUser(loginRequest);
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const acceptHeader = (req.headers.accept || "").toString();
      const wantsJson = acceptHeader.includes("application/json") || req.xhr;

      if (wantsJson) {
        ResponseHandler.success(res, user, "Login successful", 200);
      } else {
        res.redirect("/home");
      }
    } catch (error: any) {
      const acceptHeader = (req.headers.accept || "").toString();
      const wantsJson = acceptHeader.includes("application/json") || req.xhr;

      if (wantsJson) {
        next(error);
      } else {
        const errorMessage = error.message || "Login failed";
        res.render("user/login", { error: errorMessage });
      }
    }
  };

  logoutUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }

        const acceptHeader = (req.headers.accept || "").toString();
        const wantsJson = acceptHeader.includes("application/json") || req.xhr;

        if (wantsJson) {
          ResponseHandler.success(res, null, "Logout successful", 200);
        } else {
          res.redirect("/");
        }
      });
    } catch (error) {
      next(error);
    }
  };
}