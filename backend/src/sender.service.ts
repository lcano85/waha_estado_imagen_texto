import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryLog, Promotion, WahaConfiguration } from './entities';

@Injectable()
export class SenderService {
  private logger = new Logger(SenderService.name);
  constructor(
    @InjectRepository(WahaConfiguration) private configurations: Repository<WahaConfiguration>,
    @InjectRepository(DeliveryLog) private logs: Repository<DeliveryLog>,
  ) {}
  async send(promo: Promotion, scheduleId?: number, runDate = new Date().toISOString().slice(0, 10)) {
    if (!promo.active) throw new Error('La promoción está inactiva y no puede enviarse');
    const ids = promo.configurationIds?.length ? promo.configurationIds : [promo.configurationId];
    const results = [];
    for (const configurationId of ids) results.push(await this.sendToConfiguration(promo, configurationId, scheduleId, runDate));
    return { sent: true, results };
  }
  private async sendToConfiguration(promo: Promotion, configurationId: number, scheduleId?: number, runDate = new Date().toISOString().slice(0, 10)) {
    const duplicate = scheduleId && await this.logs.exist({ where: { scheduleId, configurationId, runDate, status: 'SENT' } });
    if (duplicate) return { skipped: true, configurationId, reason: 'Ya fue enviada hoy' };
    const config = await this.configurations.findOneBy({ id: configurationId, active: true });
    if (!config) throw new Error(`La configuración WAHA #${configurationId} no existe o está inactiva`);
    const log = await this.logs.save(this.logs.create({ promotionId: promo.id, configurationId, scheduleId, runDate, status: 'PENDING', trigger: scheduleId ? 'CRON' : 'MANUAL' }));
    try {
      const response = await fetch(config.url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Api-Key': config.apiKey }, body: JSON.stringify({ file: { mimetype: 'image/png', url: promo.imageUrl }, caption: promo.message }) });
      const body = await response.text(); log.status = response.ok ? 'SENT' : 'FAILED'; log.response = body.slice(0, 4000); await this.logs.save(log);
      if (!response.ok) throw new Error(`WAHA respondió ${response.status}: ${body}`);
      return { sent: true, configurationId, response: body };
    } catch (e) { log.status = 'FAILED'; log.response = String(e); await this.logs.save(log); this.logger.error(e); throw e; }
  }
}
