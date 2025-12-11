import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { OrgsService } from './orgs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orgs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrgsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Post()
  @Roles('owner')
  create(@Body() body: { name: string }, @Request() req) {
    const user = req.user;
    return this.orgsService.create(body.name, user.userId);
  }

  @Get('me')
  @Roles('owner')
  getMine(@Request() req) {
    return this.orgsService.findById(req.user.orgId);
  }
}

