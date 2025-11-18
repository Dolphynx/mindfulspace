import { IsOptional, IsString } from "class-validator";

export class GetResourcesDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;
}
