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
  assignedTo: string;

  @Prop({ default: false })
  isCompleted: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task); 