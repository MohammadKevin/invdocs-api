import { IsString, MaxLength, MinLength, IsUUID } from 'class-validator';

export class CreateBoxDto {
  @IsString()
  @MinLength(10)
  @MaxLength(150)
  description!: string;

  @IsUUID()
  rackId!: string;

  @IsString()
  name_box!: string;
}
