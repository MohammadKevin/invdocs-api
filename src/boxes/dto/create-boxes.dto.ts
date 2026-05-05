import { IsNotEmpty, IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateBoxDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  description: string;

  @IsNotEmpty()
  @IsUUID()
  rackId: string;
}
