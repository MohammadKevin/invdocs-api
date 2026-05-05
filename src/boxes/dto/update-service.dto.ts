import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBoxDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name_box?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  description?: string;
}
