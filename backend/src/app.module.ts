import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AdminUser, AppSetting, DeliveryLog, Promotion, PromotionSchedule, WahaConfiguration } from './entities';
import { AuthController, AuthService, JwtAuthGuard } from './auth';
import { AppController } from './app.controller';
import { PromotionsService } from './promotions.service';
import { SenderService } from './sender.service';
import { SchedulerService } from './scheduler.service';

const entities = [Promotion, PromotionSchedule, AppSetting, DeliveryLog, AdminUser, WahaConfiguration];
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRoot({ type: 'mysql', host: process.env.DB_HOST || 'localhost', port: +(process.env.DB_PORT || 3306), username: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME || 'terranova_estados_waha', entities, synchronize: false }), TypeOrmModule.forFeature(entities), ScheduleModule.forRoot(), JwtModule.register({ global: true, secret: process.env.JWT_SECRET || 'change-me', signOptions: { expiresIn: '8h' } })],
  controllers: [AppController, AuthController], providers: [PromotionsService, SenderService, SchedulerService, AuthService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
