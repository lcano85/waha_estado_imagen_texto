import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum Shift { MORNING = 'MORNING', AFTERNOON = 'AFTERNOON' }

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 120 }) name: string;
  @Column({ type: 'text' }) imageUrl: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'enum', enum: Shift }) shift: Shift;
  @Column({ default: true }) active: boolean;
  @Column() configurationId: number;
  @Column({ type: 'simple-json', nullable: true }) configurationIds: number[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('waha_configurations')
export class WahaConfiguration {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) name: string;
  @Column({ type: 'text' }) url: string;
  @Column({ type: 'text' }) apiKey: string;
  @Column({ length: 7, default: '#D94F70' }) color: string;
  @Column({ default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('promotion_schedules')
export class PromotionSchedule {
  @PrimaryGeneratedColumn() id: number;
  @Column() promotionId: number;
  @Column({ type: 'tinyint' }) dayOfWeek: number;
  @Column({ type: 'time' }) sendTime: string;
  @Column({ default: true }) active: boolean;
}

@Entity('app_settings')
export class AppSetting {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, length: 80 }) key: string;
  @Column({ type: 'text' }) value: string;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('delivery_logs')
export class DeliveryLog {
  @PrimaryGeneratedColumn() id: number;
  @Column() promotionId: number;
  @Column({ nullable: true }) configurationId: number;
  @Column({ nullable: true }) scheduleId: number;
  @Column({ length: 10 }) runDate: string;
  @Column({ length: 20, default: 'PENDING' }) status: string;
  @Column({ length: 20, default: 'MANUAL' }) trigger: string;
  @Column({ type: 'text', nullable: true }) response: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true, length: 160 }) email: string;
  @Column({ length: 100 }) passwordHash: string;
  @Column({ length: 100, default: 'Administrador' }) name: string;
  @Column({ default: true }) active: boolean;
  @CreateDateColumn() createdAt: Date;
}

@Entity('reminder_groups')
export class ReminderGroup {
  @PrimaryGeneratedColumn() id: number;
  @Column() configurationId: number;
  @Column({ length: 100 }) session: string;
  @Column({ length: 180 }) groupChatId: string;
  @Column({ length: 140 }) name: string;
  @Column({ default: true }) active: boolean;
  @Column({ type: 'datetime', nullable: true }) lastSyncedAt: Date;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('group_participants')
export class GroupParticipant {
  @PrimaryGeneratedColumn() id: number;
  @Column() groupId: number;
  @Column({ length: 180 }) wahaParticipantId: string;
  @Column({ type: 'varchar', length: 180, nullable: true }) phoneJid: string | null;
  @Column({ type: 'varchar', length: 40, nullable: true }) phone: string | null;
  @Column({ type: 'varchar', length: 140, nullable: true }) alias: string | null;
  @Column({ length: 30, default: 'participant' }) role: string;
  @Column({ default: true }) active: boolean;
  @Column({ default: true }) allowReminders: boolean;
  @Column({ type: 'simple-json', nullable: true }) rawData: Record<string, unknown>;
  @CreateDateColumn() firstSeenAt: Date;
  @Column({ type: 'datetime' }) lastSeenAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

export enum ReminderStatus { SCHEDULED = 'SCHEDULED', PROCESSING = 'PROCESSING', SENT = 'SENT', FAILED = 'FAILED', CANCELLED = 'CANCELLED' }
export enum ReminderDeliveryMode { GROUP_MENTION = 'GROUP_MENTION' }

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn() id: number;
  @Column() groupId: number;
  @Column() participantId: number;
  @Column({ length: 30, default: ReminderDeliveryMode.GROUP_MENTION }) deliveryMode: ReminderDeliveryMode;
  @Column({ length: 160, default: 'Recordatorio' }) subject: string;
  @Column({ type: 'text' }) message: string;
  @Column({ type: 'simple-json', nullable: true }) selectedDays: number[] | null;
  @Column({ type: 'time', nullable: true }) sendTime: string | null;
  @Column({ type: 'datetime' }) scheduledAt: Date;
  @Column({ length: 60, default: 'America/Lima' }) timezone: string;
  @Column({ length: 20, default: ReminderStatus.SCHEDULED }) status: ReminderStatus;
  @Column({ default: true }) active: boolean;
  @Column({ type: 'datetime', nullable: true }) sentAt: Date | null;
  @Column({ type: 'text', nullable: true }) lastError: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('reminder_deliveries')
export class ReminderDelivery {
  @PrimaryGeneratedColumn() id: number;
  @Column() reminderId: number;
  @Column({ unique: true, length: 120 }) idempotencyKey: string;
  @Column({ length: 20, default: 'PENDING' }) status: string;
  @Column({ default: 1 }) attempt: number;
  @Column({ type: 'text', nullable: true }) request: string | null;
  @Column({ type: 'text', nullable: true }) response: string | null;
  @Column({ type: 'text', nullable: true }) error: string | null;
  @Column({ type: 'datetime' }) scheduledFor: Date;
  @Column({ type: 'datetime', nullable: true }) sentAt: Date | null;
  @CreateDateColumn() createdAt: Date;
}
