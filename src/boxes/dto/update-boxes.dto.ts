import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBoxDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;
}
