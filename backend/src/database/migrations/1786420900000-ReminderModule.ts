import { MigrationInterface, QueryRunner } from 'typeorm';
export class ReminderModule1786420900000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`CREATE TABLE reminder_groups (id int NOT NULL AUTO_INCREMENT, configurationId int NOT NULL, session varchar(100) NOT NULL, groupChatId varchar(180) NOT NULL, name varchar(140) NOT NULL, active tinyint NOT NULL DEFAULT 1, lastSyncedAt datetime NULL, createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX UQ_reminder_group (configurationId, groupChatId), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`CREATE TABLE group_participants (id int NOT NULL AUTO_INCREMENT, groupId int NOT NULL, wahaParticipantId varchar(180) NOT NULL, phoneJid varchar(180) NULL, phone varchar(40) NULL, alias varchar(140) NULL, role varchar(30) NOT NULL DEFAULT 'participant', active tinyint NOT NULL DEFAULT 1, allowReminders tinyint NOT NULL DEFAULT 1, rawData text NULL, firstSeenAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), lastSeenAt datetime NOT NULL, updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX UQ_group_participant (groupId, wahaParticipantId), INDEX IDX_participant_group (groupId), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`CREATE TABLE reminders (id int NOT NULL AUTO_INCREMENT, groupId int NOT NULL, participantId int NOT NULL, deliveryMode varchar(30) NOT NULL DEFAULT 'GROUP_MENTION', message text NOT NULL, scheduledAt datetime NOT NULL, timezone varchar(60) NOT NULL DEFAULT 'America/Lima', status varchar(20) NOT NULL DEFAULT 'SCHEDULED', active tinyint NOT NULL DEFAULT 1, sentAt datetime NULL, lastError text NULL, createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX IDX_reminder_due (status, active, scheduledAt), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`CREATE TABLE reminder_deliveries (id int NOT NULL AUTO_INCREMENT, reminderId int NOT NULL, idempotencyKey varchar(120) NOT NULL, status varchar(20) NOT NULL DEFAULT 'PENDING', attempt int NOT NULL DEFAULT 1, request text NULL, response text NULL, error text NULL, scheduledFor datetime NOT NULL, sentAt datetime NULL, createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX UQ_reminder_delivery_key (idempotencyKey), INDEX IDX_delivery_reminder (reminderId), PRIMARY KEY (id)) ENGINE=InnoDB`);
    await q.query(`ALTER TABLE reminder_groups ADD CONSTRAINT FK_reminder_group_configuration FOREIGN KEY (configurationId) REFERENCES waha_configurations(id) ON DELETE RESTRICT`);
    await q.query(`ALTER TABLE group_participants ADD CONSTRAINT FK_participant_group FOREIGN KEY (groupId) REFERENCES reminder_groups(id) ON DELETE CASCADE`);
    await q.query(`ALTER TABLE reminders ADD CONSTRAINT FK_reminder_group FOREIGN KEY (groupId) REFERENCES reminder_groups(id) ON DELETE CASCADE`);
    await q.query(`ALTER TABLE reminders ADD CONSTRAINT FK_reminder_participant FOREIGN KEY (participantId) REFERENCES group_participants(id) ON DELETE RESTRICT`);
    await q.query(`ALTER TABLE reminder_deliveries ADD CONSTRAINT FK_delivery_reminder FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE`);
  }
  async down(q: QueryRunner) {
    await q.query('ALTER TABLE reminder_deliveries DROP FOREIGN KEY FK_delivery_reminder');
    await q.query('ALTER TABLE reminders DROP FOREIGN KEY FK_reminder_participant');
    await q.query('ALTER TABLE reminders DROP FOREIGN KEY FK_reminder_group');
    await q.query('ALTER TABLE group_participants DROP FOREIGN KEY FK_participant_group');
    await q.query('ALTER TABLE reminder_groups DROP FOREIGN KEY FK_reminder_group_configuration');
    await q.query('DROP TABLE reminder_deliveries'); await q.query('DROP TABLE reminders'); await q.query('DROP TABLE group_participants'); await q.query('DROP TABLE reminder_groups');
  }
}
