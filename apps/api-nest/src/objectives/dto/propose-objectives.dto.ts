import type { ObjectiveLevel } from '../objectives.types';
import { IsIn, IsString } from 'class-validator';

export class ProposeObjectivesDto {
  @IsString()
  // @IsUUID() si c’est un UUID
  sessionTypeId!: string;
}

export class SaveObjectiveDto {
  @IsString()
  sessionTypeId!: string;

  @IsIn(['easy', 'normal', 'challenge'])
  level!: ObjectiveLevel;
}
