import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  send(@Body() dto: CreateMessageDto, @Request() req) {
    return this.chatService.send(dto, req.user);
  }

  @Get()
  list(@Request() req) {
    return this.chatService.list(req.user);
  }
}

