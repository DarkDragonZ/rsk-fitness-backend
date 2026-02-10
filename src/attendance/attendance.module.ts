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
// import { AttendanceScan } from './attendance-scan.entity';  // New
// import { AttendanceScanListener } from './attendance-scan.listener';
import { AttendanceGateway } from './attendance.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }]),
    // TypeOrmModule.forFeature([AttendanceScan]),
    MembersModule,
    NotificationsModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceGateway],
  // FIX: Nest threw UnknownExportException because `AttendanceService` was exported
  // while it was not part of this module's context (the `providers` list was commented out).
  // Nest only allows exporting providers/modules that are declared in `providers` or
  // imported and re-exported. We re-added `AttendanceService` to `providers` so this
  // export is valid and DI works.
  exports: [AttendanceService],
})
export class AttendanceModule {}
