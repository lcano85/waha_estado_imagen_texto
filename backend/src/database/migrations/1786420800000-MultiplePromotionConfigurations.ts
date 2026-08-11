import { MigrationInterface, QueryRunner } from 'typeorm';
export class MultiplePromotionConfigurations1786420800000 implements MigrationInterface {
 async up(q:QueryRunner){await q.query('ALTER TABLE promotions ADD configurationIds text NULL');await q.query('UPDATE promotions SET configurationIds=CONCAT("[", configurationId, "]")');await q.query('ALTER TABLE delivery_logs ADD configurationId int NULL')}
 async down(q:QueryRunner){await q.query('ALTER TABLE delivery_logs DROP COLUMN configurationId');await q.query('ALTER TABLE promotions DROP COLUMN configurationIds')}
}
