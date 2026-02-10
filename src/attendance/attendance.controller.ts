import { Controller, Post, Get, Param, HttpStatus, Res, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('api/v1/attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  private readonly logger = new Logger(AttendanceController.name);

  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('scan/:memberId')
  async markAttendance(@Param('memberId') memberId: string, @Res() res: Response) {
    this.logger.log(`Received request to mark attendance for memberId: ${memberId}`);

    if (!Types.ObjectId.isValid(memberId)) {
      this.logger.error(`Invalid memberId format: ${memberId}`);
      throw new BadRequestException('Invalid memberId format. Must be a valid MongoDB ObjectId.');
    }

    try {
      const attendance = await this.attendanceService.createOrUpdateAttendance(memberId);
      this.logger.log(`Attendance marked for member ID: ${memberId}`);
      return res.status(HttpStatus.OK).json(attendance);
    } catch (error) {
      this.logger.error(`Failed to mark attendance for member ID ${memberId}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get()
  async getAll(@Res() res: Response) {
    try {
      const attendances = await this.attendanceService.getAll();
      return res.status(HttpStatus.OK).json(attendances);
    } catch (error) {
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    try {
      const attendance = await this.attendanceService.getById(id);
      this.logger.log(`Retrieved attendance record ID: ${id}`);
      return res.status(HttpStatus.OK).json(attendance);
    } catch (error) {
      this.logger.error(`Failed to retrieve attendance record ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get('member/:memberId')
  async getByMemberId(@Param('memberId') memberId: string, @Res() res: Response) {
    this.logger.log(`Fetching attendance for memberId: ${memberId}`);
    if (!Types.ObjectId.isValid(memberId)) {
      this.logger.error(`Invalid memberId format: ${memberId}`);
      throw new BadRequestException('Invalid memberId format. Must be a valid MongoDB ObjectId.');
    }
    try {
      const attendances = await this.attendanceService.getByMemberId(memberId);
      this.logger.log(`Retrieved ${attendances.length} attendance records for member ID: ${memberId}`);
      return res.status(HttpStatus.OK).json(attendances);
    } catch (error) {
      this.logger.error(`Failed to retrieve attendance for member ID ${memberId}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}