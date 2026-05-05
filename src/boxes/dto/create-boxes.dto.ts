import { IsString, MaxLength, MinLength, IsUUID } from 'class-validator';

export class CreateBoxDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name_box!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(150)
  description!: string;

  @IsUUID()
  rackId!: string;
}
