import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(150)
  description?: string;
}
