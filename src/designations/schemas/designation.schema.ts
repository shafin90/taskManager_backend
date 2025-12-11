import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DesignationDocument = Designation & Document;

@Schema({ timestamps: true })
export class Designation {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['senior', 'junior', 'mid-level', 'fresher'] })
  role: 'senior' | 'junior' | 'mid-level' | 'fresher';
}

export const DesignationSchema = SchemaFactory.createForClass(Designation);


