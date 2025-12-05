import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class ProgramExerciseDto {
    @IsUUID()
    exerciceTypeId!: string;

    @IsOptional()
    @IsInt()
    defaultRepetitionCount?: number;

    @IsOptional()
    @IsInt()
    defaultSets?: number;
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
    @Type(() => ProgramExerciseDto)
    exercices!: ProgramExerciseDto[];
}

export class CreateWorkoutProgramDto {
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
