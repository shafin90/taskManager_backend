import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Org, OrgDocument } from './schemas/org.schema';

@Injectable()
export class OrgsService {
  constructor(@InjectModel(Org.name) private orgModel: Model<OrgDocument>) {}

  async create(name: string, ownerId: string): Promise<OrgDocument> {
    const existing = await this.orgModel.findOne({ name }).lean().exec();
    if (existing) {
      throw new ConflictException('Organization name already in use');
    }
    const org = new this.orgModel({ name, ownerId });
    return org.save();
  }

  async setOwner(orgId: string, ownerId: string): Promise<OrgDocument> {
    const updated = await this.orgModel.findByIdAndUpdate(orgId, { ownerId }, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException('Org not found');
    }
    return updated;
  }

  async findById(id: string): Promise<OrgDocument> {
    const org = await this.orgModel.findById(id).exec();
    if (!org) throw new NotFoundException('Org not found');
    return org;
  }
}

