import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class NotificationDto {
  @IsOptional()
  @IsString()
  notificationId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Message cannot be blank' })
  message: string;

  @IsDateString()
  @IsOptional()
  dateCreated?: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;

  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  type: string;
}