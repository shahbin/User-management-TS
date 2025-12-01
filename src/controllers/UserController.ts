import { Request, Response, NextFunction } from "express";
import { IUserService } from "../services/IUserService";
import { IUserCreateRequest, IUserUpdateRequest, IPaginationQuery } from "../dtos/user.dto";
import { ResponseHandler } from "../utils/response";

export class UserController {
  constructor(private userService: IUserService) {}

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: IPaginationQuery = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        role: req.query.role as string,
      };

      const result = await this.userService.getAllUsers(query);

      ResponseHandler.paginated(
        res,
        result.data,
        result.total,
        result.page,
        result.limit,
        "Users retrieved successfully",
        200
      );
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await this.userService.getUserById(id);

      ResponseHandler.success(res, user, "User retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, role } = req.body;

      const createRequest: IUserCreateRequest = {
        name,
        email,
        password,
        role: role || "user",
      };

      const user = await this.userService.createUser(createRequest);

      ResponseHandler.success(res, user, "User created successfully", 201);
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updateData: IUserUpdateRequest = req.body;

      const user = await this.userService.updateUser(id, updateData);

      ResponseHandler.success(res, user, "User updated successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await this.userService.deleteUser(id);

      ResponseHandler.success(res, null, "User deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await this.userService.blockUser(id);

      ResponseHandler.success(res, user, "User blocked successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const user = await this.userService.unblockUser(id);

      ResponseHandler.success(res, user, "User unblocked successfully", 200);
    } catch (error) {
      next(error);
    }
  };
}
