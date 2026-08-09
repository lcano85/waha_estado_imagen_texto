import { MigrationInterface, QueryRunner } from 'typeorm';
export class AdminUsers1723150001000 implements MigrationInterface {
  name = 'AdminUsers1723150001000';
  async up(q: QueryRunner) { await q.query(`CREATE TABLE admin_users (id int NOT NULL AUTO_INCREMENT, email varchar(160) NOT NULL, passwordHash varchar(100) NOT NULL, name varchar(100) NOT NULL DEFAULT 'Administrador', active tinyint NOT NULL DEFAULT 1, createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX IDX_admin_email (email), PRIMARY KEY (id)) ENGINE=InnoDB`); }
  async down(q: QueryRunner) { await q.query('DROP TABLE admin_users'); }
}
