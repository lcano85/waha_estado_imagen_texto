import { MigrationInterface, QueryRunner } from 'typeorm';
export class WeeklyReminders1786421000000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`ALTER TABLE reminders ADD subject varchar(160) NOT NULL DEFAULT 'Recordatorio' AFTER deliveryMode`);
    await q.query(`ALTER TABLE reminders ADD selectedDays text NULL AFTER message`);
    await q.query(`ALTER TABLE reminders ADD sendTime time NULL AFTER selectedDays`);
  }
  async down(q: QueryRunner) {
    await q.query('ALTER TABLE reminders DROP COLUMN sendTime');
    await q.query('ALTER TABLE reminders DROP COLUMN selectedDays');
    await q.query('ALTER TABLE reminders DROP COLUMN subject');
  }
}
