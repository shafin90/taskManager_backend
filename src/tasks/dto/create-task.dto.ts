import { IsString, IsNotEmpty, IsDate, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['TODO', 'IN_PROGRESS', 'DONE'])
  @IsNotEmpty()
  status: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dueDate: Date;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  @IsString()
  @IsOptional()
  assignedTo?: string;
} 