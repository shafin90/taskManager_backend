import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true, enum: ['TODO', 'IN_PROGRESS', 'DONE'] })
  status: string;

  @Prop({ required: true })
  dueDate: Date;

  @Prop()
  priority: number;

  @Prop()
  assignedTo?: string;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true })
  orgId: string;

  @Prop()
  projectId?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task); 

TaskSchema.index({ status: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ orgId: 1 });