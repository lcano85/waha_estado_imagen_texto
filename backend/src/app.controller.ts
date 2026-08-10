import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateConfigurationDto, CreatePromotionDto, CreateScheduleDto, SettingDto } from './dto';
import { PromotionsService } from './promotions.service';
import { SenderService } from './sender.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Promotion } from './entities';
import { Repository } from 'typeorm';
import { Public } from './auth';

@Controller('api')
export class AppController {
  constructor(private service: PromotionsService, private sender: SenderService, @InjectRepository(Promotion) private promos: Repository<Promotion>) {}
  @Public() @Get() health() { return { status: 'ok', service: 'Terranova Promos API', version: '1.0.0' }; }
  @Get('dashboard') dashboard() { return this.service.dashboard(); }
  @Post('promotions') create(@Body() dto: CreatePromotionDto) { return this.service.createPromotion(dto); }
  @Patch('promotions/:id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreatePromotionDto>) { return this.service.updatePromotion(id, dto); }
  @Patch('promotions/:id/status') status(@Param('id',ParseIntPipe)id:number,@Body('active')active:boolean){return this.service.setPromotionStatus(id,active)}
  @Delete('promotions/:id') remove(@Param('id', ParseIntPipe) id: number) { return this.service.removePromotion(id); }
  @Post('promotions/:id/send') async send(@Param('id', ParseIntPipe) id: number) { const p = await this.promos.findOneByOrFail({ id }); return this.sender.send(p); }
  @Post('promotions/:id/duplicate') duplicate(@Param('id',ParseIntPipe)id:number){return this.service.duplicatePromotion(id)}
  @Post('schedules') schedule(@Body() dto: CreateScheduleDto) { return this.service.createSchedule(dto); }
  @Delete('schedules/:id') unschedule(@Param('id', ParseIntPipe) id: number) { return this.service.removeSchedule(id); }
  @Patch('schedules/:id') updateSchedule(@Param('id',ParseIntPipe)id:number,@Body()dto:Partial<CreateScheduleDto>){return this.service.updateSchedule(id,dto)}
  @Post('promotions/:id/schedules') replaceSchedules(@Param('id',ParseIntPipe)id:number,@Body()body:{days:number[];sendTime:string;active:boolean}){return this.service.replaceSchedules(id,body.days,body.sendTime,body.active)}
  @Post('settings') setting(@Body() dto: SettingDto) { return this.service.saveSetting(dto); }
  @Get('logs') logs() { return this.service.recentLogs(); }
  @Post('configurations') configuration(@Body()dto:CreateConfigurationDto){return this.service.createConfiguration(dto)}
  @Patch('configurations/:id') updateConfiguration(@Param('id',ParseIntPipe)id:number,@Body()dto:Partial<CreateConfigurationDto>){return this.service.updateConfiguration(id,dto)}
  @Delete('configurations/:id') removeConfiguration(@Param('id',ParseIntPipe)id:number){return this.service.removeConfiguration(id)}
}
