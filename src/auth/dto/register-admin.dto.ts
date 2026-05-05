import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class RegisterAdminDto {
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  name_rack!: string;
}
