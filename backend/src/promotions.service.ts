import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConfigurationDto, CreatePromotionDto, CreateScheduleDto, SettingDto } from './dto';
import { AppSetting, DeliveryLog, Promotion, PromotionSchedule, WahaConfiguration } from './entities';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion) private promos: Repository<Promotion>,
    @InjectRepository(PromotionSchedule) private schedules: Repository<PromotionSchedule>,
    @InjectRepository(AppSetting) private settings: Repository<AppSetting>,
    @InjectRepository(DeliveryLog) private logs: Repository<DeliveryLog>,
    @InjectRepository(WahaConfiguration) private configurations: Repository<WahaConfiguration>,
  ) {}
  async dashboard() {
    const [promotions, schedules, settings, logs, configurations] = await Promise.all([
      this.promos.find({ order: { createdAt: 'DESC' } }), this.schedules.find(),
      this.settings.find(), this.logs.find({ order: { createdAt: 'DESC' }, take: 30 }), this.configurations.find({order:{name:'ASC'}}),
    ]);
    return { promotions, schedules, settings: Object.fromEntries(settings.map(x => [x.key, x.value])), logs, configurations };
  }
  createPromotion(dto: CreatePromotionDto) { return this.promos.save(this.promos.create(dto)); }
  async updatePromotion(id: number, dto: Partial<CreatePromotionDto>) {
    const item = await this.promos.findOneBy({ id }); if (!item) throw new NotFoundException();
    return this.promos.save(Object.assign(item, dto));
  }
  async removePromotion(id: number) { await this.schedules.delete({ promotionId: id }); return this.promos.delete(id); }
  async createSchedule(dto: CreateScheduleDto) {
    if (!await this.promos.exist({ where: { id: dto.promotionId } })) throw new NotFoundException('Promoción no encontrada');
    return this.schedules.save(this.schedules.create(dto));
  }
  removeSchedule(id: number) { return this.schedules.delete(id); }
  async updateSchedule(id:number,dto:Partial<CreateScheduleDto>){const item=await this.schedules.findOneBy({id});if(!item)throw new NotFoundException('Programación no encontrada');return this.schedules.save(Object.assign(item,dto))}
  async saveSetting(dto: SettingDto) {
    let row = await this.settings.findOneBy({ key: dto.key });
    row = row ? Object.assign(row, { value: dto.value }) : this.settings.create(dto);
    return this.settings.save(row);
  }
  recentLogs() { return this.logs.find({ order: { createdAt: 'DESC' }, take: 50 }); }
  createConfiguration(dto: CreateConfigurationDto) { return this.configurations.save(this.configurations.create(dto)); }
  async updateConfiguration(id:number,dto:Partial<CreateConfigurationDto>){const item=await this.configurations.findOneBy({id});if(!item)throw new NotFoundException();return this.configurations.save(Object.assign(item,dto))}
  async removeConfiguration(id:number){if(await this.promos.exist({where:{configurationId:id}})) throw new Error('La configuración tiene promociones asociadas');return this.configurations.delete(id)}
}
