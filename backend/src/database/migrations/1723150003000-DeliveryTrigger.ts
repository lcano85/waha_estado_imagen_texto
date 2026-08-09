import { MigrationInterface, QueryRunner } from 'typeorm';
export class DeliveryTrigger1723150003000 implements MigrationInterface {
  name='DeliveryTrigger1723150003000';
  async up(q:QueryRunner){await q.query(`ALTER TABLE delivery_logs ADD \`trigger\` varchar(20) NOT NULL DEFAULT 'MANUAL' AFTER status`);await q.query(`UPDATE delivery_logs SET \`trigger\`='CRON' WHERE scheduleId IS NOT NULL`)}
  async down(q:QueryRunner){await q.query('ALTER TABLE delivery_logs DROP COLUMN `trigger`')}
}
