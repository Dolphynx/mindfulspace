import { IsInt, IsISO8601, IsOptional, IsString, Min } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsInt()
  quality?: number;

  @IsISO8601()
  dateSession!: string; // ISO string from frontend

  @IsString()
  sessionTypeId!: string;

  // Optional: have the frontend send what unit it expects (“Minutes” | “Hours”)
  @IsOptional()
  @IsString()
  expectedUnit?: string;
}
