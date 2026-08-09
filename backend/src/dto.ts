import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Matches, Max, Min } from 'class-validator';
import { Shift } from './entities';

export class CreatePromotionDto {
  @IsString() name: string;
  @IsUrl({ require_tld: false }) imageUrl: string;
  @IsString() message: string;
  @IsEnum(Shift) shift: Shift;
  @IsInt() configurationId: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class CreateScheduleDto {
  @IsInt() promotionId: number;
  @IsInt() @Min(1) @Max(6) dayOfWeek: number;
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) sendTime: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class SettingDto { @IsString() key: string; @IsString() value: string; }
export class CreateConfigurationDto {
  @IsString() name: string;
  @IsUrl({ require_tld: false }) url: string;
  @IsString() apiKey: string;
  @Matches(/^#[0-9A-Fa-f]{6}$/) color: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
