import { MigrationInterface, QueryRunner } from 'typeorm';
export class WahaConfigurations1723150002000 implements MigrationInterface {
  name='WahaConfigurations1723150002000';
  async up(q:QueryRunner){
    await q.query(`CREATE TABLE waha_configurations (id int NOT NULL AUTO_INCREMENT, name varchar(100) NOT NULL, url text NOT NULL, apiKey text NOT NULL, color varchar(7) NOT NULL DEFAULT '#E36C39', active tinyint NOT NULL DEFAULT 1, createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY(id)) ENGINE=InnoDB`);
    await q.query(`INSERT INTO waha_configurations (name,url,apiKey,color) VALUES ('Terranova principal', COALESCE((SELECT value FROM app_settings WHERE \`key\`='WAHA_URL' LIMIT 1),'http://localhost:3031/api/negocio_local/status/image'), COALESCE((SELECT value FROM app_settings WHERE \`key\`='WAHA_API_KEY' LIMIT 1),''), '#E36C39')`);
    await q.query(`ALTER TABLE promotions ADD configurationId int NULL`);
    await q.query(`UPDATE promotions SET configurationId=(SELECT id FROM waha_configurations ORDER BY id LIMIT 1)`);
    await q.query(`ALTER TABLE promotions MODIFY configurationId int NOT NULL`);
    await q.query(`ALTER TABLE promotions ADD INDEX IDX_promotion_configuration (configurationId)`);
    await q.query(`ALTER TABLE promotions ADD CONSTRAINT FK_promotion_configuration FOREIGN KEY(configurationId) REFERENCES waha_configurations(id) ON DELETE RESTRICT`);
  }
  async down(q:QueryRunner){await q.query('ALTER TABLE promotions DROP FOREIGN KEY FK_promotion_configuration');await q.query('ALTER TABLE promotions DROP COLUMN configurationId');await q.query('DROP TABLE waha_configurations')}
}
