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
