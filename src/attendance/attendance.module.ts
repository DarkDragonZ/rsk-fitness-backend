// attendance.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSchema } from './attendance.schema';
import { MembersModule } from '../member/members.module';
import { NotificationsModule } from '../notification/notifications.module';
import { PaymentModule } from '../payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';  // New
import { AttendanceScan } from './attendance-scan.entity';  // New
import { AttendanceScanListener } from './attendance-scan.listener';
import { AttendanceGateway } from './attendance.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }]),
    TypeOrmModule.forFeature([AttendanceScan]),
    MembersModule,
    NotificationsModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceScanListener, AttendanceGateway],
  exports: [AttendanceService],
})
export class AttendanceModule {}