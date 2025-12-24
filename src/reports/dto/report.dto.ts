export class CreateReportDto {
    responderId: string;
    requestMessage: string;
    taskId?: string;
}

export class SubmitReportDto {
    responseMessage: string;
}

export class ReviewReportDto {
    grade: number;
}
