import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Member } from '../member/member.schema';

@Schema({ collection: 'payments', timestamps: true })
export class Payment extends Document {
  @Prop({ type: Types.ObjectId, ref: Member.name, required: true })
  member: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true })
  paymentDate: Date;

  @Prop({ required: true })
  validUntilDate: Date;

  @Prop({ required: true })
  paymentStatus: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
