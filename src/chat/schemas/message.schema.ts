import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true })
  orgId: string;

  @Prop({ required: true })
  senderId: string;

  @Prop()
  recipientId?: string; // null for broadcast/room

  @Prop({ required: true })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ orgId: 1, createdAt: -1 });

