import { IUserRegisterRequest, IUserLoginRequest, IUserResponse, IUserCreateRequest, IUserUpdateRequest, IPaginationQuery, IPaginatedResponse } from "../dtos/user.dto";

export interface IUserService {

  registerUser(request: IUserRegisterRequest): Promise<IUserResponse>;

  loginUser(request: IUserLoginRequest): Promise<IUserResponse>;

  getUserById(id: string): Promise<IUserResponse>;

  getAllUsers(query: IPaginationQuery): Promise<IPaginatedResponse<IUserResponse>>;

  updateUser(id: string, updateData: IUserUpdateRequest): Promise<IUserResponse>;

  deleteUser(id: string): Promise<void>;

  blockUser(id: string): Promise<IUserResponse>;

  unblockUser(id: string): Promise<IUserResponse>;

  createUser(request: IUserCreateRequest): Promise<IUserResponse>;
}
