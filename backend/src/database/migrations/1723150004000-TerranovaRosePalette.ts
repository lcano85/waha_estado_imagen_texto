import { MigrationInterface, QueryRunner } from 'typeorm';
export class TerranovaRosePalette1723150004000 implements MigrationInterface {
  name='TerranovaRosePalette1723150004000';
  async up(q:QueryRunner){await q.query(`UPDATE waha_configurations SET color='#D94F70' WHERE color='#E36C39'`)}
  async down(q:QueryRunner){await q.query(`UPDATE waha_configurations SET color='#E36C39' WHERE color='#D94F70'`)}
}
