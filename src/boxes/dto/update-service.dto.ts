import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateBoxDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  description?: string;
}
