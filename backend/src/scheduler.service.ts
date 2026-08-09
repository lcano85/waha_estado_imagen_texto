import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionSchedule } from './entities';
import { SenderService } from './sender.service';

@Injectable()
export class SchedulerService {
  private logger = new Logger(SchedulerService.name);
  constructor(@InjectRepository(PromotionSchedule) private schedules: Repository<PromotionSchedule>, @InjectRepository(Promotion) private promos: Repository<Promotion>, private sender: SenderService) {}
  @Cron('0 * * * * *', { timeZone: process.env.TIMEZONE || 'America/Lima' })
  async tick() {
    if (process.env.WORKER_PROCESS !== 'true') return;
    const now = new Date(); const local = new Intl.DateTimeFormat('en-CA', { timeZone: process.env.TIMEZONE || 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
    const part = (x: string) => local.find(p => p.type === x)?.value || '';
    const dayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    const day = dayMap[part('weekday')]; if (!day) return;
    const time = `${part('hour')}:${part('minute')}`; const date = `${part('year')}-${part('month')}-${part('day')}`;
    const jobs = await this.schedules.findBy({ dayOfWeek: day, sendTime: time + ':00', active: true });
    for (const job of jobs) { const promo = await this.promos.findOneBy({ id: job.promotionId, active: true }); if (promo) await this.sender.send(promo, job.id, date).catch(e => this.logger.error(e)); }
  }
}
