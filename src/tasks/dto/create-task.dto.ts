import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MinDate,
} from 'class-validator';
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
  @MinDate(new Date())
  @IsNotEmpty()
  dueDate: Date;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  priority?: number;

  // Assigned userId (must be a junior in the same org)
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

