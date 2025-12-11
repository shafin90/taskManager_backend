import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TargetDocument = Target & Document;

export type TargetPeriod = 'week' | 'month' | 'quarter' | 'year';

@Schema({ timestamps: true })
export class Target {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['week', 'month', 'quarter', 'year'] })
  period: TargetPeriod;

  @Prop({ default: 'open', enum: ['open', 'in_progress', 'done'] })
  status: 'open' | 'in_progress' | 'done';

  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @Prop()
  dueDate?: Date;
}

export const TargetSchema = SchemaFactory.createForClass(Target);

TargetSchema.index({ orgId: 1, period: 1 });

