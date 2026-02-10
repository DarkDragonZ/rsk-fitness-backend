import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Member } from '../member/member.schema';

@Schema({ collection: 'attendance' })
export class Attendance extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  member: Types.ObjectId;

  @Prop({type:Date, required: true })
  date: Date;

  @Prop({type:Date, required: true })
  timeIn: Date;

  @Prop()
  timeOut?: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);