import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

type AuthUser = {
  userId: string;
  role: 'owner' | 'senior' | 'junior';
  orgId?: string;
};

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private msgModel: Model<MessageDocument>) {}

  async send(dto: CreateMessageDto, user: AuthUser) {
    if (!user.orgId) throw new ForbiddenException('Org missing');
    const msg = new this.msgModel({
      orgId: user.orgId,
      senderId: user.userId,
      recipientId: dto.recipientId,
      content: dto.content,
    });
    return msg.save();
  }

  async list(user: AuthUser) {
    if (!user.orgId) throw new ForbiddenException('Org missing');
    // Show org messages; optional recipient filter later
    return this.msgModel.find({ orgId: user.orgId }).sort({ createdAt: -1 }).limit(100).lean().exec();
  }
}

