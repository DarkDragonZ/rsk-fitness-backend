import { IsString, IsInt, IsNumber, IsEmail, IsNotEmpty, Length, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class MemberDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsInt()
  @IsNotEmpty({ message: 'Age is required' })
  age: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsNotEmpty({ message: 'NIC number is required' })
  @Length(1, 12, { message: 'NIC number must be between 1 and 12 characters' })
  nicNumber: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  @Length(1, 15, { message: 'Mobile number must be between 1 and 15 characters' })
  mobileNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @IsString()
  @IsOptional()
  qrCodeData?: string;

  @IsString()
  @IsOptional()
  fingerprintData?: string;

  @IsString()
  @IsOptional()
  faceImageData?: string;

  @IsDateString()
  @IsOptional()
  membershipStartDate?: string;

  @IsBoolean()
  @IsOptional()
  activeStatus?: boolean;
}

export class EmailRequestDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}