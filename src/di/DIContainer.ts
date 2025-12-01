import { IUserRepository } from "../repositories/IUserRepository";
import { UserRepository } from "../repositories/UserRepository";
import { UserService } from "../services/UserService";
import { AuthController } from "../controllers/authController";
import { UserController } from "../controllers/UserController";
import { IUserService } from "../services/IUserService";

export class DIContainer {
  private static instance: DIContainer;
  
  private userRepository: IUserRepository | null = null;
  private userService: IUserService | null = null;
  private authController: AuthController | null = null;
  private userController: UserController | null = null;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository();
    }
    return this.userRepository;
  }

  getUserService(): IUserService {
    if (!this.userService) {
      const repository = this.getUserRepository();
      this.userService = new UserService(repository);
    }
    return this.userService;
  }

  getAuthController(): AuthController {
    if (!this.authController) {
      const service = this.getUserService();
      this.authController = new AuthController(service);
    }
    return this.authController;
  }

  getUserController(): UserController {
    if (!this.userController) {
      const service = this.getUserService();
      this.userController = new UserController(service);
    }
    return this.userController;
  }

  reset(): void {
    this.userRepository = null;
    this.userService = null;
    this.authController = null;
    this.userController = null;
  }
}

export const diContainer = DIContainer.getInstance();
