// import { Injectable, Inject, Logger, HttpException } from '@nestjs/common';
// import {
//   RegisterPgTableChangeListener,
//   PgTableChangeListener,
//   PgTableChanges,
//   PgTableChangeErrorHandler,
// } from '@cisstech/nestjs-pg-pubsub';
// import { AttendanceScan } from './attendance-scan.entity';
// import { AttendanceService } from './attendance.service';
// import { AttendanceGateway } from './attendance.gateway';
// import { HttpStatus } from '@nestjs/common';

// @Injectable()
// @RegisterPgTableChangeListener(AttendanceScan)  // Registers listener for this entity
// export class AttendanceScanListener implements PgTableChangeListener<AttendanceScan> {
//   private readonly logger = new Logger(AttendanceScanListener.name);

//   constructor(
//     private readonly attendanceService: AttendanceService,  // Inject your existing service
//     private readonly attendanceGateway: AttendanceGateway
//   ) {}

//   async process(
//     changes: PgTableChanges<AttendanceScan>,
//     onError?: PgTableChangeErrorHandler,
//   ): Promise<void> {
//     try {
//       // Handle INSERT events (new scan data inserted into PG table)
//       changes.INSERT.forEach(async (insert) => {
//         const nicNumber = insert.data.employeeid;
//         this.logger.log(`New attendance scan detected for nicNumber: ${nicNumber}`);

//         try{
//           // Trigger your existing MongoDB-based attendance marking
//           let attendanceDto = await this.attendanceService.createOrUpdateAttendance(nicNumber);
//           this.logger.log("Attendance Service Return Data", attendanceDto);

//           this.attendanceGateway.broadcastAttendance({
//             success: true,
//             data: attendanceDto,
//           });
//         }catch (error) {
//           this.logger.log('Error processing attendance scan:', error);
//           const errorMessage = error instanceof HttpException
//             ? {message: error.message, status: error.getStatus()}
//             : {message: 'Unkown error occured', status: HttpStatus.INTERNAL_SERVER_ERROR};
//           this.attendanceGateway.broadcastAttendance({
//             success: false,
//             data: errorMessage,
//           })
//         }

//       });
//     } catch (error) {
//       console.error('Error processing attendance scan:', error);
//       if (onError) {
//         onError(changes.all.map(change => change.id));  // Queue for retry
//       }
//       throw error;
//     }
//   }
// }