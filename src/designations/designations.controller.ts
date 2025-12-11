import { Body, Controller, Get, Param, Post, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('designations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Post()
  @Roles('owner')
  create(@Body() body: { name: string; description?: string; role: 'senior' | 'junior' | 'mid-level' | 'fresher' }, @Request() req) {
    return this.designationsService.create(req.user.orgId, body.name, body.description, body.role);
  }

  @Get('org/:orgId')
  @Roles('owner', 'senior')
  findByOrg(@Param('orgId') orgId: string, @Request() req) {
    if (orgId !== req.user.orgId) {
      throw new ForbiddenException('Cross-organization access denied');
    }
    return this.designationsService.findByOrg(orgId);
  }
}

