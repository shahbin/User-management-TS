import { IUserResponse, IUserUpdateRequest, IPaginationQuery, IPaginatedResponse } from "../dtos/user.dto";

export interface IUserRepository {

  findByEmail(email: string): Promise<any>;

  findById(id: string): Promise<IUserResponse | null>;

  create(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<any>;

  update(id: string, updateData: IUserUpdateRequest): Promise<IUserResponse | null>;

  delete(id: string): Promise<boolean>;

  findAll(query: IPaginationQuery): Promise<IPaginatedResponse<IUserResponse>>;

  toggleBlockUser(id: string, isBlocked: boolean): Promise<IUserResponse | null>;

  emailExists(email: string): Promise<boolean>;
}
