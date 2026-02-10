import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from './payment.schema';
import { PaymentDto } from './payment.dto';
import { MembersService } from '../member/members.service';
import { NotificationsService } from '../notification/notifications.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private membersService: MembersService,
    private notificationsService: NotificationsService,
  ) {}

  async create(paymentDto: PaymentDto): Promise<PaymentDto> {
    const { memberId, amount, validUntilDate, paymentStatus } = paymentDto;

    const member = await this.membersService.getById(memberId);
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const validUntil = new Date(validUntilDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (validUntil < today) {
      throw new BadRequestException('Valid until date must be today or in the future');
    }

    const payment = new this.paymentModel({
      member: new Types.ObjectId(memberId),
      amount,
      paymentDate: new Date(),
      validUntilDate: validUntil,
      paymentStatus,
    });

    const savedPayment = await payment.save();

    await this.notificationsService.create({
      message: `Payment of ${amount} recorded for member ${member.name}`,
      type: 'PAYMENT_CREATED',
    });

    return this.mapToDto(savedPayment);
  }

  async findAll(): Promise<PaymentDto[]> {
    const payments = await this.paymentModel.find().populate('member').exec();
    return payments.map(this.mapToDto);
  }

  async findOne(id: string): Promise<PaymentDto> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }
    const payment = await this.paymentModel.findById(id).populate('member').exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return this.mapToDto(payment);
  }

  async findLatestByMemberId(memberId: string): Promise<PaymentDto | null> {
    if (!Types.ObjectId.isValid(memberId)) {
      throw new BadRequestException('Invalid memberId format');
    }
    const payment = await this.paymentModel
      .findOne({ member: new Types.ObjectId(memberId) })
      .sort({ validUntilDate: -1 })
      .populate('member')
      .exec();
    return payment ? this.mapToDto(payment) : null;
  }

  async update(id: string, paymentDto: PaymentDto): Promise<PaymentDto> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }

    const { memberId, amount, paymentDate, validUntilDate, paymentStatus } = paymentDto;
    const member = await this.membersService.getById(memberId);
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }

    const validUntil = new Date(validUntilDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (validUntil < today) {
      throw new BadRequestException('Valid until date must be today or in the future');
    }

    const payment = await this.paymentModel
      .findByIdAndUpdate(
        id,
        {
          member: new Types.ObjectId(memberId),
          amount,
          paymentDate: new Date(paymentDate),
          validUntilDate: validUntil,
          paymentStatus,
        },
        { new: true },
      )
      .populate('member')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    await this.notificationsService.create({
      message: `Payment of ${amount} updated for member ${member.name}`,
      type: 'PAYMENT_UPDATED',
    });

    return this.mapToDto(payment);
  }

  async delete(id: string): Promise<void> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid payment ID');
    }
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
  }

  private mapToDto(payment: Payment): PaymentDto {
    return {
      paymentId: payment._id.toString(),
      memberId: payment.member.id.toString(),
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      validUntilDate: payment.validUntilDate.toISOString(),
      paymentStatus: payment.paymentStatus,
    };
  }
}