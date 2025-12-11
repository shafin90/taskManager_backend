import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['owner', 'senior', 'junior'], default: 'junior' })
  role: 'owner' | 'senior' | 'junior';

  @Prop({ required: true })
  orgId: string;

  @Prop({ required: false })
  designationId?: string;

  // For juniors, who they report to (a senior)
  @Prop({ required: false })
  managerId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ orgId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ managerId: 1 });

