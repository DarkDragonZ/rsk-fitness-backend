import { Module } from '@nestjs/common';
import { MembersModule } from '../member/members.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { PaymentModule } from '../payment/payment.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from '../member/member.schema';
import { Attendance, AttendanceSchema } from '../attendance/attendance.schema';
import { Payment, PaymentSchema } from '../payment/payment.schema';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    MembersModule,
    AttendanceModule,
    PaymentModule,
    MongooseModule.forFeature([
      {name: Member.name, schema: MemberSchema},
      {name: Attendance.name, schema: AttendanceSchema},
      {name: Payment.name, schema: PaymentSchema},
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})

export class ReportsModule {}