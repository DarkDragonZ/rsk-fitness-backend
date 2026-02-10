import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'members' })
export class Member extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  age: number;

  @Prop()
  height?: number;

  @Prop()
  weight?: number;

  @Prop({ required: true, unique: true, maxlength: 12 })
  nicNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true, maxlength: 15 })
  mobileNumber: string;

  @Prop({ required: true })
  address: string;

  @Prop()
  qrCodeData?: string;

  @Prop()
  fingerprintData?: string;

  @Prop()
  faceImageData?: string;

  @Prop({ required: true, default: () => new Date() })
  membershipStartDate: Date;

  @Prop({ required: true, default: true })
  activeStatus: boolean;
}

export const MemberSchema = SchemaFactory.createForClass(Member);