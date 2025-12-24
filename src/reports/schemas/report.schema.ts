import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
    @Prop({ required: true })
    requesterId: string; // The boss (CEO/Senior)

    @Prop({ required: true })
    responderId: string; // The employee (Senior/Junior)

    @Prop()
    taskId?: string; // Optional context

    @Prop({ required: true }) // 'Please give me a report on X'
    requestMessage: string;

    @Prop() // 'Here is the report...'
    responseMessage?: string;

    @Prop({ enum: ['REQUESTED', 'SUBMITTED', 'REVIEWED'], default: 'REQUESTED' })
    status: 'REQUESTED' | 'SUBMITTED' | 'REVIEWED';

    @Prop({ min: 0, max: 100 })
    grade?: number; // Performance score for this report

    @Prop({ required: true })
    orgId: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

ReportSchema.index({ requesterId: 1 });
ReportSchema.index({ responderId: 1 });
ReportSchema.index({ orgId: 1 });
