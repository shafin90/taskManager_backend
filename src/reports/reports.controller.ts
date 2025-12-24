import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto, SubmitReportDto, ReviewReportDto } from './dto/report.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post()
    create(@Request() req, @Body() createReportDto: CreateReportDto) {
        return this.reportsService.create(createReportDto, req.user.userId, req.user.orgId);
    }

    @Get()
    findAll(@Request() req) {
        return this.reportsService.findAllForUser(req.user.userId, req.user.orgId);
    }

    @Patch(':id/submit')
    submit(@Request() req, @Param('id') id: string, @Body() submitDto: SubmitReportDto) {
        return this.reportsService.submit(id, submitDto, req.user.userId);
    }

    @Patch(':id/review')
    review(@Request() req, @Param('id') id: string, @Body() reviewDto: ReviewReportDto) {
        return this.reportsService.review(id, reviewDto, req.user.userId);
    }

    @Get('stats/org')
    getStats(@Request() req) {
        return this.reportsService.getStats(req.user.orgId);
    }
}
