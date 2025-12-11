import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  orgName: string;

  // Only owners can self-register; other roles are created by the owner
  @IsIn(['owner'])
  role: 'owner' = 'owner';
}

