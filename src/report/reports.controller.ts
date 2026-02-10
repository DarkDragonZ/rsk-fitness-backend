import { Controller, Get, HttpStatus, Logger, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name)

  constructor(private readonly reportService: ReportsService) { }

  @Get('stats')
  async getStats(@Res() res:Response){
    try{
      const stats = await this.reportService.getStats();
      this.logger.log(`Stats Data ${stats}`);
      return res.status(HttpStatus.OK).json(stats)
    }catch (error) {
      this.logger.error(`Error Getting Stats ${error.message()}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({message: error.message})
    }
  }

  @Get('revenueReport')
  async getRevenueData(@Query('filter') filter: 'week' | 'month' | 'year', @Res() res:Response){
    try{
      const data = await this.reportService.getRevenueData(filter);
      this.logger.log(`Revenue Data Result ${data}`);
      return res.status(HttpStatus.OK).json(data);
    }catch (error) {
      this.logger.error(`Revenue Data Getting Failed ${error.message}`)
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
  }

  @Get('attendanceReport')
  async getAttendance(@Query('filter') filter: 'week' | 'month' | 'year', @Res() res:Response){
    try {
      const data = await this.reportService.getAttendanceData(filter);
      this.logger.log(`Attendance Report Result ${data}`)
      return res.status(HttpStatus.OK).json(data);
    }catch (error) {
      this.logger.error(`Attendance Report Data Getting Failed ${error.message}`)
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({message: error.message});
    }
  }
}