import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateReminderDto, CreateReminderGroupDto, UpdateParticipantDto } from './dto';
import { RemindersService } from './reminders.service';

@Controller('api/reminders')
export class RemindersController {
  constructor(private reminders: RemindersService) {}
  @Get('overview') overview() { return this.reminders.overview(); }
  @Post('groups') createGroup(@Body() dto: CreateReminderGroupDto) { return this.reminders.createGroup(dto); }
  @Patch('groups/:id/status') groupStatus(@Param('id', ParseIntPipe) id: number, @Body('active') active: boolean) { return this.reminders.setGroupStatus(id, active); }
  @Post('groups/:id/sync') sync(@Param('id', ParseIntPipe) id: number) { return this.reminders.syncParticipants(id); }
  @Patch('participants/:id') participant(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateParticipantDto) { return this.reminders.updateParticipant(id, dto); }
  @Post() create(@Body() dto: CreateReminderDto) { return this.reminders.createReminder(dto); }
  @Post(':id/send') send(@Param('id', ParseIntPipe) id: number) { return this.reminders.sendNow(id); }
  @Patch(':id/cancel') cancel(@Param('id', ParseIntPipe) id: number) { return this.reminders.cancelReminder(id); }
}
