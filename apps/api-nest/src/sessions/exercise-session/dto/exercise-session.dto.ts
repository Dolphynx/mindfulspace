import {
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExerciceSerieDto {
  @IsUUID()
  exerciceContentId!: string;

  @IsInt()
  repetitionCount!: number;
}

export class CreateExerciceSessionDto {
  @IsOptional()
  @IsInt()
  quality?: number;

  @IsISO8601()
  dateSession!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExerciceSerieDto)
  exercices!: CreateExerciceSerieDto[];
}
