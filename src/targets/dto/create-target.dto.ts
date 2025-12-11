import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTargetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['week', 'month', 'quarter', 'year'])
  period: 'week' | 'month' | 'quarter' | 'year';

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}

