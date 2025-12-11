import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['senior', 'junior'])
  role: 'senior' | 'junior';

  @IsString()
  @IsOptional()
  designationId?: string;

  @ValidateIf((o) => o.role === 'junior')
  @IsString()
  @IsNotEmpty()
  managerId?: string;
}

