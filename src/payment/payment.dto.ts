import { IsNotEmpty, IsPositive, IsString, IsDateString } from 'class-validator';

export class PaymentDto {
  paymentId?: string;

  @IsNotEmpty({ message: 'Member ID is required' })
  @IsString({ message: 'Member ID must be a string' })
  memberId: string;

  @IsPositive({ message: 'Amount must be positive' })
  amount: number;

  @IsNotEmpty({ message: 'Payment date is required' })
  @IsDateString()
  paymentDate: string;

  @IsNotEmpty({ message: 'Valid until date is required' })
  @IsDateString()
  validUntilDate: string;

  @IsNotEmpty({ message: 'Payment status is required' })
  @IsString({ message: 'Payment status must be a string' })
  paymentStatus: string;
}