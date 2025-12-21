import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class ProgramTranslationDto {
  @IsString()
  languageCode!: string; // "fr", "en"

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class ProgramDayTranslationDto {
  @IsString()
  languageCode!: string;

  @IsString()
  title!: string;
}


class ProgramExerciceItemDto {
    @IsUUID()
    exerciceContentId!: string;

    @IsOptional()
    @IsInt()
    defaultRepetitionCount?: number;

    @IsOptional()
    @IsInt()
    defaultSets?: number;
}

class ProgramDayDto {
  @IsInt()
  order!: number;

  @IsOptional()
  @IsInt()
  weekday?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramDayTranslationDto)
  translations!: ProgramDayTranslationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramExerciceItemDto)
  exercices!: ProgramExerciceItemDto[];
}


export class CreateProgramDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramTranslationDto)
  translations!: ProgramTranslationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramDayDto)
  days!: ProgramDayDto[];
}

