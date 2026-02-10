import { Controller, Post, Get, Put, Delete, Body, Param, HttpStatus, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from './notification.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

@Controller('api/v1/notification')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getAll(@Res() res: Response) {
    try {
      const notifications = await this.notificationsService.getAll();
      this.logger.log(`Retrieved ${notifications.length} notifications`);
      return res.status(HttpStatus.OK).json(notifications);
    } catch (error) {
      this.logger.error(`Failed to retrieve notifications: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    try {
      const notification = await this.notificationsService.getById(id);
      this.logger.log(`Retrieved notification: ${notification.message}`);
      return res.status(HttpStatus.OK).json(notification);
    } catch (error) {
      this.logger.error(`Failed to retrieve notification with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Put(':id/mark-as-read')
  async markAsRead(@Param('id') id: string, @Res() res: Response) {
    try {
      const updatedNotification = await this.notificationsService.markAsRead(id);
      this.logger.log(`Marked notification as read: ${updatedNotification.message}`);
      return res.status(HttpStatus.OK).json(updatedNotification);
    } catch (error) {
      this.logger.error(`Failed to mark notification as read with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.notificationsService.delete(id);
      this.logger.log(`Deleted notification with ID ${id}`);
      return res.status(HttpStatus.NO_CONTENT).send();
    } catch (error) {
      this.logger.error(`Failed to delete notification with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}