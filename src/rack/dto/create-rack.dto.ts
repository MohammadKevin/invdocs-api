import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateRackDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
