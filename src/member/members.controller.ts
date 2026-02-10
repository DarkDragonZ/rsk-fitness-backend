import { Controller, Post, Get, Put, Body, Param, HttpStatus, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { MembersService } from './members.service';
import {MemberDto} from './member.dto';
import { EmailRequestDto } from './emailRequest.dto';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';

@Controller('api/v1/member')
@UseGuards(JwtAuthGuard)
export class MembersController {
  private readonly logger = new Logger(MembersController.name);

  constructor(private readonly membersService: MembersService) {
  }

  @Post()
  async create(@Body() memberDto: MemberDto, @Res() res: Response) {
    try {
      const savedMember = await this.membersService.create(memberDto);
      this.logger.log(`Member created: ${savedMember.email}`);
      return res.status(HttpStatus.OK).json(savedMember);
    } catch (error) {
      this.logger.error(`Failed to create member: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get()
  async getAll(@Res() res: Response) {
    try {
      const members = await this.membersService.getAll();
      this.logger.log(`Retrieved ${members.length} members`);
      return res.status(HttpStatus.OK).json(members);
    } catch (error) {
      this.logger.error(`Failed to retrieve members: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    this.logger.log(`Requested ID: ${id}`);
    try {
      const member = await this.membersService.getById(id);
      this.logger.log(`Retrieved member: ${member.email}`);

      return res.status(HttpStatus.OK).json(member);
    } catch (error) {
      this.logger.error(`Failed to retrieve member with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() memberDto: MemberDto, @Res() res: Response) {
    try {
      const updatedMember = await this.membersService.update(id, memberDto);
      this.logger.log(`Updated member: ${updatedMember.email}`);
      return res.status(HttpStatus.OK).json(updatedMember);
    } catch (error) {
      this.logger.error(`Failed to update member with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.membersService.deactivate(id);
      this.logger.log(`Deactivated member with ID ${id}: ${result}`);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(`Failed to deactivate member with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Put(':id/activate')
  async activate(@Param('id') id: string, @Res() res: Response) {
    try {
      const result = await this.membersService.activate(id);
      this.logger.log(`Activated member with ID ${id}: ${result}`);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(`Failed to activate member with ID ${id}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }

  @Post('send-qr')
  async sendQrEmail(@Body() request: EmailRequestDto, @Res() res: Response) {
    try {
      const message = await this.membersService.sendQrEmail(request);
      this.logger.log(`QR code email sent to ${request.email}`);
      return res.status(HttpStatus.OK).json(message);
    } catch (error) {
      this.logger.error(`Failed to send QR email to ${request.email}: ${error.message}`);
      return res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}