import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

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

class ProgramSleepItemDto {
    @IsOptional()
    @IsInt()
    defaultHours?: number;
}

class ProgramDayDto {
    @IsString()
    title!: string;

    @IsInt()
    order!: number;

    @IsOptional()
    @IsInt()
    weekday?: number; // 1–7

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProgramExerciceItemDto)
    exercices!: ProgramExerciceItemDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProgramSleepItemDto)
    sleepItems!: ProgramSleepItemDto[];
}

export class CreateProgramDto {
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProgramDayDto)
    days!: ProgramDayDto[];
}
