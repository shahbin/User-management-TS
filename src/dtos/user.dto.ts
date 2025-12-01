export interface IUserRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface IUserLoginRequest {
  email: string;
  password: string;
}

export interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreateRequest {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
}

export interface IUserUpdateRequest {
  name?: string;
  email?: string;
  role?: string;
  isBlocked?: boolean;
}

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
