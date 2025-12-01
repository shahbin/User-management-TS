import bcrypt from "bcrypt";
import { IUserService } from "./IUserService";
import { IUserRepository } from "../repositories/IUserRepository";
import {
  IUserRegisterRequest,
  IUserLoginRequest,
  IUserResponse,
  IUserCreateRequest,
  IUserUpdateRequest,
  IPaginationQuery,
  IPaginatedResponse,
} from "../dtos/user.dto";
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} from "../utils/errors";
import { UserValidator } from "../utils/validators";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async registerUser(request: IUserRegisterRequest): Promise<IUserResponse> {
    UserValidator.validateRegisterInput(request.name, request.email, request.password);

    const emailExists = await this.userRepository.emailExists(request.email);
    if (emailExists) {
      throw new ConflictError("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const user = await this.userRepository.create({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      role: "user",
    });

    return this.mapUserToResponse(user);
  }

  async loginUser(request: IUserLoginRequest): Promise<IUserResponse> {
    UserValidator.validateLoginInput(request.email, request.password);

    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new AuthenticationError("Incorrect email or password");
    }

    if (user.isBlocked) {
      throw new AuthenticationError("Your account has been blocked by admin");
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Incorrect email or password");
    }

    return this.mapUserToResponse(user);
  }

  async getUserById(id: string): Promise<IUserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  async getAllUsers(query: IPaginationQuery): Promise<IPaginatedResponse<IUserResponse>> {
    return this.userRepository.findAll(query);
  }

  async updateUser(id: string, updateData: IUserUpdateRequest): Promise<IUserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }

    if (updateData.email) {
      UserValidator.validateEmail(updateData.email);

      const emailExists = await this.userRepository.emailExists(updateData.email);
      if (emailExists && updateData.email !== user.email) {
        throw new ConflictError("Email already in use");
      }
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundError("User");
    }

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User");
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError("User");
    }
  }

  async blockUser(id: string): Promise<IUserResponse> {
    const user = await this.userRepository.toggleBlockUser(id, true);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  async unblockUser(id: string): Promise<IUserResponse> {
    const user = await this.userRepository.toggleBlockUser(id, false);
    if (!user) {
      throw new NotFoundError("User");
    }
    return user;
  }

  async createUser(request: IUserCreateRequest): Promise<IUserResponse> {
    UserValidator.validateRegisterInput(request.name, request.email, request.password);

    const emailExists = await this.userRepository.emailExists(request.email);
    if (emailExists) {
      throw new ConflictError("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const user = await this.userRepository.create({
      name: request.name,
      email: request.email,
      password: hashedPassword,
      role: request.role || "user",
    });

    return this.mapUserToResponse(user);
  }

  private mapUserToResponse(user: any): IUserResponse {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
