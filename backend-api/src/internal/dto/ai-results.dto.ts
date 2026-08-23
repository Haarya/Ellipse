import { IsArray, IsNumber, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ClassificationDto {
  @IsOptional()
  @IsString()
  macroCategory?: string;

  @IsOptional()
  @IsNumber()
  macroConfidence?: number;

  @IsOptional()
  @IsString()
  microCategory?: string;

  @IsOptional()
  @IsNumber()
  microConfidence?: number;

  @IsArray()
  @IsString({ each: true })
  wasteTypes: string[];
}

class DimensionsDto {
  @IsNumber()
  widthMeters: number;

  @IsNumber()
  lengthMeters: number;

  @IsNumber()
  peakHeightMeters: number;
}

class SpatialMetricsDto {
  @IsNumber()
  volumeM3: number;

  @IsString()
  volumeConfidence: string;

  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;
}

class DispatchRecommendationDto {
  @IsNumber()
  severityScore: number;

  @IsNumber()
  tier: number;

  @IsArray()
  @IsString({ each: true })
  hazardFlags: string[];

  @IsString()
  action: string;
}

export class AiResultsDto {
  @ValidateNested()
  @Type(() => ClassificationDto)
  classification: ClassificationDto;

  @ValidateNested()
  @Type(() => SpatialMetricsDto)
  spatialMetrics: SpatialMetricsDto;

  @ValidateNested()
  @Type(() => DispatchRecommendationDto)
  dispatchRecommendation: DispatchRecommendationDto;
}
