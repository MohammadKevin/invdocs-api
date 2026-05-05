import { IsOptional, MaxLength } from 'class-validator';

export class UpdateRackDto {
  @IsOptional()
  @MaxLength(100)
  name?: string;
}
