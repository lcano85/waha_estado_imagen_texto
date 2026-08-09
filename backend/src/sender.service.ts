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
    const duplicate = scheduleId && await this.logs.exist({ where: { scheduleId, runDate, status: 'SENT' } });
    if (duplicate) return { skipped: true, reason: 'Ya fue enviada hoy' };
    const config=await this.configurations.findOneBy({id:promo.configurationId,active:true});
    if(!config) throw new Error('La configuración WAHA asociada no existe o está inactiva');
    const url=config.url,apiKey=config.apiKey;
    const log = await this.logs.save(this.logs.create({ promotionId: promo.id, scheduleId, runDate, status: 'PENDING', trigger: scheduleId ? 'CRON' : 'MANUAL' }));
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-Api-Key': apiKey }, body: JSON.stringify({ file: { mimetype: 'image/png', url: promo.imageUrl }, caption: promo.message }) });
      const body = await response.text(); log.status = response.ok ? 'SENT' : 'FAILED'; log.response = body.slice(0, 4000); await this.logs.save(log);
      if (!response.ok) throw new Error(`WAHA respondió ${response.status}: ${body}`);
      return { sent: true, response: body };
    } catch (e) { log.status = 'FAILED'; log.response = String(e); await this.logs.save(log); this.logger.error(e); throw e; }
  }
}
