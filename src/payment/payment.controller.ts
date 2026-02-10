import { Controller, Post, Get, Put, Delete, Body, Param, HttpStatus, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';
import { PaymentDto } from './payment.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

@Controller('api/v1/payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async create(@Body() paymentDto: PaymentDto, @Res() res: Response) {
    try {
      const savedPayment = await this.paymentService.create(paymentDto);
      this.logger.log(`Payment created: ${savedPayment.amount} for member ${savedPayment.memberId}`);
      return res.status(HttpStatus.OK).json(savedPayment);
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get()
  async getAll(@Res() res: Response) {
    try {
      const payments = await this.paymentService.findAll();
      return res.status(HttpStatus.OK).json(payments);
    } catch (error) {
      this.logger.error(`Failed to retrieve payments: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    try {
      const payment = await this.paymentService.findOne(id);
      this.logger.log(`Retrieved payment: ${payment.amount} for member ${payment.memberId}`);
      return res.status(HttpStatus.OK).json(payment);
    } catch (error) {
      this.logger.error(`Failed to retrieve payment with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() paymentDto: PaymentDto, @Res() res: Response) {
    try {
      const updatedPayment = await this.paymentService.update(id, paymentDto);
      this.logger.log(`Updated payment: ${updatedPayment.amount} for member ${updatedPayment.memberId}`);
      return res.status(HttpStatus.OK).json(updatedPayment);
    } catch (error) {
      this.logger.error(`Failed to update payment with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}