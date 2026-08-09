import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1723150000000 implements MigrationInterface {
  name = 'InitialSchema1723150000000';
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE promotions (id int NOT NULL AUTO_INCREMENT, name varchar(120) NOT NULL, imageUrl text NOT NULL, message text NOT NULL, shift enum ('MORNING','AFTERNOON') NOT NULL, active tinyint NOT NULL DEFAULT 1, createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`CREATE TABLE promotion_schedules (id int NOT NULL AUTO_INCREMENT, promotionId int NOT NULL, dayOfWeek tinyint NOT NULL, sendTime time NOT NULL, active tinyint NOT NULL DEFAULT 1, INDEX IDX_schedule_promotion (promotionId), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`CREATE TABLE app_settings (id int NOT NULL AUTO_INCREMENT, \`key\` varchar(80) NOT NULL, value text NOT NULL, updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX IDX_setting_key (\`key\`), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`CREATE TABLE delivery_logs (id int NOT NULL AUTO_INCREMENT, promotionId int NOT NULL, scheduleId int NULL, runDate varchar(10) NOT NULL, status varchar(20) NOT NULL DEFAULT 'PENDING', response text NULL, createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX IDX_log_schedule_date (scheduleId, runDate), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`ALTER TABLE promotion_schedules ADD CONSTRAINT FK_schedule_promotion FOREIGN KEY (promotionId) REFERENCES promotions(id) ON DELETE CASCADE`);
    await q.query(`ALTER TABLE delivery_logs ADD CONSTRAINT FK_log_promotion FOREIGN KEY (promotionId) REFERENCES promotions(id) ON DELETE CASCADE`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE delivery_logs DROP FOREIGN KEY FK_log_promotion');
    await q.query('ALTER TABLE promotion_schedules DROP FOREIGN KEY FK_schedule_promotion');
    await q.query('DROP TABLE delivery_logs'); await q.query('DROP TABLE app_settings');
    await q.query('DROP TABLE promotion_schedules'); await q.query('DROP TABLE promotions');
  }
}
