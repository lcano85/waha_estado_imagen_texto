import { Body, CanActivate, Controller, ExecutionContext, Injectable, OnModuleInit, Post, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcryptjs';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Repository } from 'typeorm';
import { AdminUser } from './entities';
export const Public = () => SetMetadata('public', true);
export class LoginDto { @IsEmail() email: string; @IsString() @MinLength(6) password: string; }
@Injectable() export class AuthService implements OnModuleInit {
  constructor(@InjectRepository(AdminUser) private users: Repository<AdminUser>, private jwt: JwtService) {}
  async onModuleInit() { const email=(process.env.ADMIN_EMAIL||'admin@terranova.pe').toLowerCase(); if(!await this.users.exist({where:{email}})) await this.users.save(this.users.create({email,name:'Administrador',passwordHash:await hash(process.env.ADMIN_PASSWORD||'Terranova2026!',12)})); }
  async login(dto:LoginDto){const user=await this.users.findOneBy({email:dto.email.toLowerCase(),active:true});if(!user||!await compare(dto.password,user.passwordHash))throw new UnauthorizedException('Correo o contraseña incorrectos');return{accessToken:await this.jwt.signAsync({sub:user.id,email:user.email,role:'admin'}),user:{id:user.id,email:user.email,name:user.name}}}
}
@Controller('api/auth') export class AuthController{constructor(private auth:AuthService){} @Public() @Post('login') login(@Body()dto:LoginDto){return this.auth.login(dto)}}
@Injectable() export class JwtAuthGuard implements CanActivate {constructor(private jwt:JwtService,private reflector:Reflector){} async canActivate(context:ExecutionContext){if(this.reflector.getAllAndOverride<boolean>('public',[context.getHandler(),context.getClass()]))return true;const req=context.switchToHttp().getRequest(),token=req.headers.authorization?.replace(/^Bearer\s+/i,'');if(!token)throw new UnauthorizedException('Inicia sesión');try{req.user=await this.jwt.verifyAsync(token);return true}catch{throw new UnauthorizedException('Sesión vencida')}}}
