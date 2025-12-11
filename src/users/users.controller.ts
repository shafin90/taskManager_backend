import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Param, Patch } from '@nestjs/common';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('owner')
  createEmployee(@Body() dto: CreateEmployeeDto, @Request() req) {
    return this.usersService.createEmployee({
      ...dto,
      orgId: req.user.orgId,
    });
  }

  @Get('org')
  @Roles('owner', 'senior')
  getOrgUsers(@Request() req) {
    return this.usersService.findOrgUsers(req.user.orgId);
  }

  @Patch('assign/:juniorId')
  @Roles('owner')
  assignJunior(@Param('juniorId') juniorId: string, @Body() body: { managerId: string }, @Request() req) {
    return this.usersService.assignJunior(juniorId, body.managerId, req.user.orgId);
  }

  @Get('juniors')
  @Roles('senior')
  getMyJuniors(@Request() req) {
    return this.usersService.findJuniorsForSenior(req.user.userId, req.user.orgId);
  }
}

