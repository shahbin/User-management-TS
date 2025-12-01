import User from "../models/User";
import { IUserRepository } from "./IUserRepository";
import { IUserResponse, IUserUpdateRequest, IPaginationQuery, IPaginatedResponse } from "../dtos/user.dto";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<any> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<IUserResponse | null> {
    const user = await User.findById(id);
    if (!user) return null;
    return this.mapToUserResponse(user);
  }

  async create(userData: { name: string; email: string; password: string; role: string; }): Promise<any> {
    const user = new User({
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: userData.password,
      role: userData.role || "user",
    });
    return user.save();
  }

  async update(id: string, updateData: IUserUpdateRequest): Promise<IUserResponse | null> {
    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.email && { email: updateData.email.toLowerCase() }),
        ...(updateData.role && { role: updateData.role }),
        ...(typeof updateData.isBlocked === "boolean" && { isBlocked: updateData.isBlocked }),
      },
      { new: true }
    );

    if (!user) return null;
    return this.mapToUserResponse(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findAll(query: IPaginationQuery): Promise<IPaginatedResponse<IUserResponse>> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string,any> = {};

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.role) {
      filter.role = query.role;
    }

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((u) => this.mapToUserResponse(u)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async toggleBlockUser(id: string, isBlocked: boolean): Promise<IUserResponse | null> {
    const user = await User.findByIdAndUpdate(id, { isBlocked }, { new: true });
    if (!user) return null;
    return this.mapToUserResponse(user);
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email: email.toLowerCase() });
    return count > 0;
  }

  private mapToUserResponse(user: any): IUserResponse {
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
