import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class AttendanceDto {
  @IsOptional()
  @IsString()
  attendanceId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Member ID is required' })
  memberId: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Time-in is required' })
  timeIn: string;

  @IsDateString()
  @IsOptional()
  timeOut?: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @IsOptional()
  @IsString()
  nicNumber?: string;
}
