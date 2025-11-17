export class ProposeObjectivesDto {
  sessionTypeId!: string;
}

export class SaveObjectiveDto {
  sessionTypeId!: string;
  level!: 'easy' | 'normal' | 'challenge';
}
