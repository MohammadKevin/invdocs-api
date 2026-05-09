import { IsEnum } from 'class-validator';
import { Divisi } from '@prisma/client';

export class CreateRackDto {
  @IsEnum(Divisi)
  divisi!: Divisi;
}
