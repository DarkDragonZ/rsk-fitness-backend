import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './notification.schema';
import { NotificationDto } from './notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async create(notificationDto: NotificationDto): Promise<NotificationDto> {
    if (!notificationDto) {
      throw new HttpException('Notification data cannot be null', HttpStatus.BAD_REQUEST);
    }
    if (!notificationDto.message || notificationDto.message.trim() === '') {
      throw new HttpException('Message cannot be blank', HttpStatus.BAD_REQUEST);
    }
    if (!notificationDto.type || notificationDto.type.trim() === '') {
      throw new HttpException('Notification type is required', HttpStatus.BAD_REQUEST);
    }

    const notification = new this.notificationModel({
      ...notificationDto,
      dateCreated: new Date(),
      isRead: false,
    });
    const savedNotification = await notification.save();
    return this.mapToDto(savedNotification);
  }

  async getAll(): Promise<NotificationDto[]> {
    const notifications = await this.notificationModel.find().exec();
    return notifications.map(notification => this.mapToDto(notification));
  }

  async getById(id: string): Promise<NotificationDto> {
    if (!id) {
      throw new HttpException('Notification ID cannot be null', HttpStatus.BAD_REQUEST);
    }
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new HttpException(`Notification not found with ID: ${id}`, HttpStatus.NOT_FOUND);
    }
    return this.mapToDto(notification);
  }

  async markAsRead(id: string): Promise<NotificationDto> {
    if (!id) {
      throw new HttpException('Notification ID cannot be null', HttpStatus.BAD_REQUEST);
    }
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new HttpException(`Notification not found with ID: ${id}`, HttpStatus.NOT_FOUND);
    }
    if (notification.isRead) {
      return this.mapToDto(notification);
    }
    notification.isRead = true;
    const updatedNotification = await notification.save();
    return this.mapToDto(updatedNotification);
  }

  async delete(id: string): Promise<void> {
    if (!id) {
      throw new HttpException('Notification ID cannot be null', HttpStatus.BAD_REQUEST);
    }
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new HttpException(`Notification not found with ID: ${id}`, HttpStatus.NOT_FOUND);
    }
    await this.notificationModel.deleteOne({ _id: id }).exec();
  }

  private mapToDto(notification: Notification): NotificationDto {
    return {
      notificationId: notification._id.toString(),
      message: notification.message,
      dateCreated: notification.dateCreated.toISOString(),
      isRead: notification.isRead,
      type: notification.type,
    };
  }
}