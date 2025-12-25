import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';
import { CreateReportDto, SubmitReportDto, ReviewReportDto } from './dto/report.dto';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
    ) { }

    async create(createReportDto: CreateReportDto, requesterId: string, orgId: string) {
        const report = new this.reportModel({
            ...createReportDto,
            requesterId,
            orgId,
            status: 'REQUESTED',
        });
        return report.save();
    }

    async findAllForUser(userId: string, orgId: string) {
        // Find reports where user is requester OR responder
        // Also likely filtered by orgId
        return this.reportModel.find({
            orgId,
            $or: [{ requesterId: userId }, { responderId: userId }],
        }).sort({ createdAt: -1 }).exec();
    }

    async submit(id: string, submitDto: SubmitReportDto, userId: string) {
        const report = await this.reportModel.findById(id);
        if (!report) throw new NotFoundException('Report not found');
        if (report.responderId !== userId) {
            throw new ForbiddenException('Not authorized to submit this report');
        }
        report.responseMessage = submitDto.responseMessage;
        report.status = 'SUBMITTED';
        return report.save();
    }

    async review(id: string, reviewDto: ReviewReportDto, userId: string) {
        const report = await this.reportModel.findById(id);
        if (!report) throw new NotFoundException('Report not found');
        if (report.requesterId !== userId) {
            throw new ForbiddenException('Not authorized to review this report');
        }
        report.grade = reviewDto.grade;
        report.status = 'REVIEWED';
        return report.save();
    }

    async getStats(orgId: string) {
        return this.reportModel.aggregate([
            { $match: { orgId, status: 'REVIEWED' } },
            {
                $group: {
                    _id: '$responderId',
                    avgGrade: { $avg: '$grade' },
                    count: { $sum: 1 }
                }
            }
        ]);
    }

    async getUserStats(userId: string) {
        const stats = await this.reportModel.aggregate([
            { $match: { responderId: userId, status: 'REVIEWED' } },
            {
                $group: {
                    _id: null,
                    avgGrade: { $avg: '$grade' },
                    count: { $sum: 1 }
                }
            }
        ]);
        return stats.length > 0 ? stats[0] : { avgGrade: 0, count: 0 };
    }
}
