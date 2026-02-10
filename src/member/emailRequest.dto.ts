import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class EmailRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'QR Code is required' })
  qrCode: string;
}

