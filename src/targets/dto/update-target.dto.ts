import { PartialType } from '@nestjs/mapped-types';
import { CreateTargetDto } from './create-target.dto';
import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateTargetDto extends PartialType(CreateTargetDto) {
  @IsOptional()
  @IsEnum(['open', 'in_progress', 'done'])
  status?: 'open' | 'in_progress' | 'done';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;
}

