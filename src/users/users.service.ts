import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: userData.email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const user = new this.userModel(userData);
    return user.save();
  }

  async createEmployee(input: {
    name: string;
    email: string;
    password: string;
    role: 'senior' | 'junior';
    orgId: string;
    designationId?: string;
    managerId?: string;
  }): Promise<UserDocument> {
    if (!input.orgId) {
      throw new BadRequestException('Organization is required');
    }
    if (input.role === 'junior' && !input.managerId) {
      throw new BadRequestException('Junior must have a senior manager assigned');
    }
    if (input.managerId) {
      const manager = await this.findById(input.managerId);
      if (!manager) {
        throw new BadRequestException('Manager not found');
      }
      if (manager.orgId !== input.orgId || manager.role !== 'senior') {
        throw new BadRequestException('Manager must be a senior within the same organization');
      }
    }

    const hashed = await bcrypt.hash(input.password, 10);

    return this.create({
      ...input,
      password: hashed,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<UserDocument[]> {
    if (!ids?.length) return [];
    return this.userModel.find({ _id: { $in: ids } }).exec();
  }

  async findOrgUsers(orgId: string, role?: string): Promise<UserDocument[]> {
    const filter: Record<string, any> = { orgId };
    if (role) filter.role = role;
    return this.userModel.find(filter).exec();
  }

  async findJuniorsForSenior(seniorId: string, orgId: string): Promise<UserDocument[]> {
    return this.userModel.find({ orgId, managerId: seniorId, role: 'junior' }).exec();
  }

  async assignJunior(juniorId: string, managerId: string, orgId: string) {
    const junior = await this.userModel.findById(juniorId).exec();
    if (!junior || junior.role !== 'junior') {
      throw new BadRequestException('Junior not found');
    }
    this.ensureUserInOrg(junior, orgId);

    const manager = await this.userModel.findById(managerId).exec();
    if (!manager || manager.role !== 'senior') {
      throw new BadRequestException('Manager must be a senior');
    }
    this.ensureUserInOrg(manager, orgId);

    junior.managerId = managerId;
    await junior.save();
    return junior.toObject();
  }

  ensureUserInOrg(user: User | null, orgId: string) {
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.orgId !== orgId) {
      throw new BadRequestException('User does not belong to this organization');
    }
  }
}

