import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';

export class AiResultsDto {
  @IsArray()
  @IsString({ each: true })
  wasteTypes: string[];

  @IsNumber()
  tier: number;

  @IsOptional()
  @IsNumber()
  severityScore?: number;

  @IsOptional()
  @IsString()
  weightVersionId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  sizeEstimate?: string;

  @IsOptional()
  @IsString()
  macroCategory?: string;

  @IsOptional()
  @IsString()
  microCategory?: string;
}
