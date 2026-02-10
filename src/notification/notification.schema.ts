import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'notifications' })
export class Notification extends Document {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: () => new Date() })
  dateCreated: Date;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ required: true })
  type: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);