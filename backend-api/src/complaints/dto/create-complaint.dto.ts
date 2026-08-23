import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateComplaintDto {
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  longitude: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  compassHeading?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  sizeEstimate?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  focalLength?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  sensorWidth?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  sensorHeight?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  zoomRatio?: number;
}
