import { ArrayNotEmpty, ArrayUnique, IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUrl, Matches, Max, Min, MinLength } from 'class-validator';
import { ReminderDeliveryMode, Shift } from './entities';

export class CreatePromotionDto {
  @IsString() name: string;
  @IsUrl({ require_tld: false }) imageUrl: string;
  @IsString() message: string;
  @IsEnum(Shift) shift: Shift;
  @IsOptional() @IsInt() configurationId?: number;
  @IsArray() @ArrayNotEmpty() @ArrayUnique() @IsInt({ each: true }) configurationIds: number[];
  @IsOptional() @IsBoolean() active?: boolean;
}
export class CreateScheduleDto {
  @IsInt() promotionId: number;
  @IsInt() @Min(1) @Max(7) dayOfWeek: number;
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

export class CreateReminderGroupDto {
  @IsInt() configurationId: number;
  @IsString() @MinLength(1) session: string;
  @IsString() @Matches(/^.+@g\.us$/) groupChatId: string;
  @IsString() @MinLength(1) name: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
export class UpdateParticipantDto {
  @IsOptional() @IsString() alias?: string;
  @IsOptional() @IsBoolean() allowReminders?: boolean;
}
export class CreateReminderDto {
  @IsInt() groupId: number;
  @IsInt() participantId: number;
  @IsString() @MinLength(1) subject: string;
  @IsString() @MinLength(1) message: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsArray() @ArrayNotEmpty() @ArrayUnique() @IsInt({ each: true }) @Min(1, { each: true }) @Max(6, { each: true }) selectedDays?: number[];
  @IsOptional() @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) sendTime?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsEnum(ReminderDeliveryMode) deliveryMode?: ReminderDeliveryMode;
}
