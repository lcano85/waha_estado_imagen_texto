import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AdminUser, AppSetting, DeliveryLog, GroupParticipant, Promotion, PromotionSchedule, Reminder, ReminderDelivery, ReminderGroup, WahaConfiguration } from '../entities';

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'terranova_estados_waha',
  entities: [Promotion, PromotionSchedule, AppSetting, DeliveryLog, AdminUser, WahaConfiguration, ReminderGroup, GroupParticipant, Reminder, ReminderDelivery],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
