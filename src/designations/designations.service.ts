import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Designation, DesignationDocument } from './schemas/designation.schema';

@Injectable()
export class DesignationsService {
  constructor(@InjectModel(Designation.name) private designationModel: Model<DesignationDocument>) {}

  async create(
    orgId: string,
    name: string,
    description: string | undefined,
    role: 'senior' | 'junior' | 'mid-level' | 'fresher',
  ): Promise<Designation> {
    const designation = new this.designationModel({ orgId, name, description, role });
    return designation.save();
  }

  async findByOrg(orgId: string): Promise<Designation[]> {
    return this.designationModel.find({ orgId }).lean().exec();
  }

  async findById(id: string): Promise<Designation> {
    const d = await this.designationModel.findById(id).lean().exec();
    if (!d) throw new NotFoundException('Designation not found');
    return d;
  }
}


