import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { TargetsService } from './targets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';

@Controller('targets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @Post()
  @Roles('owner')
  create(@Body() dto: CreateTargetDto, @Request() req) {
    return this.targetsService.create(dto, req.user);
  }

  @Get()
  @Roles('owner')
  findAll(@Request() req) {
    return this.targetsService.findAll(req.user);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() dto: UpdateTargetDto, @Request() req) {
    return this.targetsService.update(id, dto, req.user);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string, @Request() req) {
    return this.targetsService.remove(id, req.user);
  }
}

