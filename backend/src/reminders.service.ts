import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CreateReminderDto, CreateReminderGroupDto, UpdateParticipantDto } from './dto';
import { GroupParticipant, Reminder, ReminderDelivery, ReminderDeliveryMode, ReminderGroup, ReminderStatus, WahaConfiguration } from './entities';

function nextWeeklyRun(days: number[], sendTime: string, after = new Date()) {
  const [hour, minute] = sendTime.slice(0, 5).split(':').map(Number);
  const lima = new Date(after.getTime() - 5 * 60 * 60 * 1000);
  for (let offset = 0; offset <= 7; offset++) {
    const localDay = new Date(Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth(), lima.getUTCDate() + offset));
    const dayOfWeek = localDay.getUTCDay() || 7;
    if (!days.includes(dayOfWeek)) continue;
    const candidate = new Date(Date.UTC(localDay.getUTCFullYear(), localDay.getUTCMonth(), localDay.getUTCDate(), hour + 5, minute));
    if (candidate.getTime() > after.getTime()) return candidate;
  }
  throw new BadRequestException('No se pudo calcular la siguiente fecha del recordatorio');
}

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(ReminderGroup) private groups: Repository<ReminderGroup>,
    @InjectRepository(GroupParticipant) private participants: Repository<GroupParticipant>,
    @InjectRepository(Reminder) private reminders: Repository<Reminder>,
    @InjectRepository(ReminderDelivery) private deliveries: Repository<ReminderDelivery>,
    @InjectRepository(WahaConfiguration) private configurations: Repository<WahaConfiguration>,
  ) {}

  async overview() {
    const [groups, participants, reminders, deliveries] = await Promise.all([
      this.groups.find({ order: { name: 'ASC' } }),
      this.participants.find({ order: { id: 'ASC' } }),
      this.reminders.find({ order: { createdAt: 'DESC' } }),
      this.deliveries.find({ order: { createdAt: 'DESC' }, take: 100 }),
    ]);
    return { groups, participants, reminders, deliveries };
  }

  async createGroup(dto: CreateReminderGroupDto) {
    const config = await this.configurations.findOneBy({ id: dto.configurationId, active: true });
    if (!config) throw new BadRequestException('La configuración WAHA no existe o está inactiva');
    return this.groups.save(this.groups.create({ ...dto, groupChatId: dto.groupChatId.trim(), session: dto.session.trim(), name: dto.name.trim() }));
  }

  async setGroupStatus(id: number, active: boolean) {
    const group = await this.groups.findOneBy({ id }); if (!group) throw new NotFoundException('Grupo no encontrado');
    group.active = active; return this.groups.save(group);
  }

  async syncParticipants(groupId: number) {
    const group = await this.groups.findOneBy({ id: groupId, active: true });
    if (!group) throw new NotFoundException('Grupo no encontrado o inactivo');
    const config = await this.configurations.findOneBy({ id: group.configurationId, active: true });
    if (!config) throw new BadRequestException('La configuración WAHA no existe o está inactiva');
    const baseUrl = new URL(config.url).origin;
    const url = `${baseUrl}/api/${encodeURIComponent(group.session)}/groups/${encodeURIComponent(group.groupChatId)}/participants/v2`;
    const response = await fetch(url, { headers: { Accept: 'application/json', 'X-Api-Key': config.apiKey } });
    const body = await response.text();
    if (!response.ok) throw new BadRequestException(`WAHA respondió ${response.status}: ${body.slice(0, 1000)}`);
    let rows: any; try { rows = JSON.parse(body); } catch { throw new BadRequestException('WAHA devolvió una respuesta no válida'); }
    if (!Array.isArray(rows)) throw new BadRequestException('WAHA no devolvió una lista de participantes');
    const now = new Date(), seen: string[] = [];
    for (const raw of rows) {
      const externalId = String(raw.id || '').trim(); if (!externalId) continue; seen.push(externalId);
      let item = await this.participants.findOneBy({ groupId, wahaParticipantId: externalId });
      const phoneJid = raw.pn ? String(raw.pn) : null;
      const phone = (phoneJid || externalId).split('@')[0].replace(/\D/g, '') || null;
      if (!item) item = this.participants.create({ groupId, wahaParticipantId: externalId, firstSeenAt: now });
      Object.assign(item, { phoneJid, phone, role: String(raw.role || 'participant'), active: true, rawData: raw, lastSeenAt: now });
      await this.participants.save(item);
    }
    if (seen.length) {
      const current = await this.participants.findBy({ groupId });
      const missing = current.filter(x => !seen.includes(x.wahaParticipantId));
      if (missing.length) await this.participants.save(missing.map(x => Object.assign(x, { active: false })));
    }
    group.lastSyncedAt = now; await this.groups.save(group);
    return { synced: seen.length, participants: await this.participants.find({ where: { groupId }, order: { id: 'ASC' } }) };
  }

  async updateParticipant(id: number, dto: UpdateParticipantDto) {
    const item = await this.participants.findOneBy({ id }); if (!item) throw new NotFoundException('Participante no encontrado');
    if (dto.alias !== undefined) item.alias = dto.alias.trim() || null;
    if (dto.allowReminders !== undefined) item.allowReminders = dto.allowReminders;
    return this.participants.save(item);
  }

  async createReminder(dto: CreateReminderDto) {
    const group = await this.groups.findOneBy({ id: dto.groupId, active: true });
    const participant = await this.participants.findOneBy({ id: dto.participantId, groupId: dto.groupId, active: true, allowReminders: true });
    if (!group) throw new BadRequestException('El grupo no existe o está inactivo');
    if (!participant) throw new BadRequestException('El participante no existe, está inactivo o no admite recordatorios');
    const days = dto.selectedDays ? [...new Set(dto.selectedDays)].sort() : null;
    if ((days?.length && !dto.sendTime) || (dto.sendTime && !days?.length)) throw new BadRequestException('Selecciona los días y la hora del recordatorio');
    const scheduledAt = days?.length && dto.sendTime ? nextWeeklyRun(days, dto.sendTime) : new Date(dto.scheduledAt || '');
    if (Number.isNaN(scheduledAt.getTime())) throw new BadRequestException('Fecha inválida');
    return this.reminders.save(this.reminders.create({ groupId: dto.groupId, participantId: dto.participantId, subject: dto.subject.trim(), message: dto.message.trim(), selectedDays: days, sendTime: dto.sendTime ? `${dto.sendTime}:00` : null, scheduledAt, timezone: dto.timezone || 'America/Lima', deliveryMode: dto.deliveryMode || ReminderDeliveryMode.GROUP_MENTION, status: ReminderStatus.SCHEDULED, active: true }));
  }

  async cancelReminder(id: number) {
    const item = await this.reminders.findOneBy({ id }); if (!item) throw new NotFoundException('Recordatorio no encontrado');
    if (item.status === ReminderStatus.SENT) throw new BadRequestException('El recordatorio ya fue enviado');
    item.status = ReminderStatus.CANCELLED; item.active = false; return this.reminders.save(item);
  }

  async due(now = new Date()) { return this.reminders.find({ where: { status: ReminderStatus.SCHEDULED, active: true, scheduledAt: LessThanOrEqual(now) }, order: { scheduledAt: 'ASC' }, take: 50 }); }

  async sendNow(id: number) {
    const item = await this.reminders.findOneBy({ id }); if (!item) throw new NotFoundException('Recordatorio no encontrado');
    if (item.status === ReminderStatus.SENT || item.status === ReminderStatus.CANCELLED) throw new BadRequestException('El recordatorio ya no puede enviarse');
    if (item.status === ReminderStatus.FAILED) { item.status = ReminderStatus.SCHEDULED; item.active = true; await this.reminders.save(item); }
    return this.execute(item);
  }

  async execute(item: Reminder) {
    const claimed = await this.reminders.update({ id: item.id, status: ReminderStatus.SCHEDULED, active: true }, { status: ReminderStatus.PROCESSING });
    if (!claimed.affected) return { skipped: true, reason: 'Ya fue procesado o cancelado' };
    const group = await this.groups.findOneBy({ id: item.groupId, active: true });
    const participant = await this.participants.findOneBy({ id: item.participantId, groupId: item.groupId, active: true, allowReminders: true });
    const config = group && await this.configurations.findOneBy({ id: group.configurationId, active: true });
    const key = `reminder:${item.id}:${new Date(item.scheduledAt).toISOString()}`;
    let delivery = await this.deliveries.findOneBy({ idempotencyKey: key });
    if (delivery) { delivery.attempt += 1; delivery.status = 'PENDING'; delivery.error = null; delivery.response = null; }
    else delivery = this.deliveries.create({ reminderId: item.id, idempotencyKey: key, scheduledFor: item.scheduledAt, status: 'PENDING' });
    delivery = await this.deliveries.save(delivery);
    try {
      if (!group || !participant || !config) throw new Error('Grupo, participante o configuración WAHA no disponible');
      const mention = participant.wahaParticipantId.split('@')[0];
      const personalized = item.message.replace(/\{\{alias\}\}/g, participant.alias || mention);
      const text = personalized.includes(`@${mention}`) ? personalized : `@${mention} ${personalized}`;
      const payload = { session: group.session, chatId: group.groupChatId, text, mentions: [participant.wahaParticipantId] };
      delivery.request = JSON.stringify({ ...payload, session: group.session });
      const response = await fetch(`${new URL(config.url).origin}/api/sendText`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Api-Key': config.apiKey }, body: JSON.stringify(payload) });
      const body = await response.text(); delivery.response = body.slice(0, 4000);
      if (!response.ok) throw new Error(`WAHA respondió ${response.status}: ${body}`);
      delivery.status = 'SENT'; delivery.sentAt = new Date(); item.sentAt = delivery.sentAt; item.lastError = null;
      if (item.selectedDays?.length && item.sendTime) { item.scheduledAt = nextWeeklyRun(item.selectedDays, item.sendTime, new Date(Math.max(Date.now(), new Date(item.scheduledAt).getTime()) + 60000)); item.status = ReminderStatus.SCHEDULED; item.active = true; }
      else { item.status = ReminderStatus.SENT; item.active = false; }
      await this.deliveries.save(delivery); await this.reminders.save(item); return { sent: true, response: body };
    } catch (error) {
      const message = String(error); delivery.status = 'FAILED'; delivery.error = message.slice(0, 4000); item.status = ReminderStatus.FAILED; item.active = false; item.lastError = message.slice(0, 4000);
      await this.deliveries.save(delivery); await this.reminders.save(item); throw error;
    }
  }
}
