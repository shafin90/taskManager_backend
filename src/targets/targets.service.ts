import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Target, TargetDocument } from './schemas/target.schema';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';

type AuthUser = {
  userId: string;
  role: 'owner' | 'senior' | 'junior';
  orgId?: string;
};

@Injectable()
export class TargetsService {
  constructor(@InjectModel(Target.name) private targetModel: Model<TargetDocument>) {}

  private ensureOwner(user: AuthUser) {
    if (user.role !== 'owner') {
      throw new ForbiddenException('Only owner can manage targets');
    }
  }

  async create(dto: CreateTargetDto, user: AuthUser): Promise<Target> {
    this.ensureOwner(user);
    const target = new this.targetModel({
      ...dto,
      orgId: user.orgId,
    });
    return target.save();
  }

  async findAll(user: AuthUser): Promise<Target[]> {
    this.ensureOwner(user);
    return this.targetModel.find({ orgId: user.orgId }).sort({ createdAt: -1 }).lean().exec();
  }

  async update(id: string, dto: UpdateTargetDto, user: AuthUser): Promise<Target> {
    this.ensureOwner(user);
    const updated = await this.targetModel
      .findOneAndUpdate({ _id: id, orgId: user.orgId }, dto, { new: true, runValidators: true })
      .lean()
      .exec();
    if (!updated) {
      throw new NotFoundException('Target not found');
    }
    return updated;
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    this.ensureOwner(user);
    const res = await this.targetModel.deleteOne({ _id: id, orgId: user.orgId }).exec();
    if (res.deletedCount === 0) {
      throw new NotFoundException('Target not found');
    }
  }
}

