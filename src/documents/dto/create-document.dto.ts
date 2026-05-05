import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(150)
  description!: string;

  @IsNotEmpty()
  @IsUUID()
  boxId!: string;
}
