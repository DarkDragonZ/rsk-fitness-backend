import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Member } from './member.schema';
import { MemberDto } from './member.dto';
import { NotificationsService } from '../notification/notifications.service';
import { EmailRequestDto } from './emailRequest.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Member.name) private memberModel: Model<Member>,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) { }

  async create(memberDto: MemberDto): Promise<MemberDto> {
    if (!memberDto) {
      throw new HttpException(
        'Member data cannot be null',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!memberDto.nicNumber || memberDto.nicNumber.trim() === '') {
      throw new HttpException('NIC number is required', HttpStatus.BAD_REQUEST);
    }
    if (!memberDto.email || memberDto.email.trim() === '') {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    const existingNic = await this.memberModel
      .findOne({ nicNumber: memberDto.nicNumber })
      .exec();
    if (existingNic) {
      throw new HttpException(
        `Member with NIC number ${memberDto.nicNumber} already exists`,
        HttpStatus.CONFLICT,
      );
    }
    const existingEmail = await this.memberModel
      .findOne({ email: memberDto.email })
      .exec();
    if (existingEmail) {
      throw new HttpException(
        `Member with email ${memberDto.email} already exists`,
        HttpStatus.CONFLICT,
      );
    }

    const member = new this.memberModel({
      ...memberDto,
      membershipStartDate: new Date(),
      activeStatus: true,
    });
    const savedMember = await member.save();

    // Create notification for member creation
    await this.notificationsService.create({
      message: `New member created: ${memberDto.name} (${memberDto.email})`,
      type: 'MEMBER_CREATED',
    });

    return this.mapToDto(savedMember);
  }

  async getAll(): Promise<MemberDto[]> {
    const members = await this.memberModel.find().exec();
    return members.map((member) => this.mapToDto(member));
  }

  async getById(memberId: string): Promise<MemberDto> {
    if (!memberId) {
      throw new HttpException(
        'Member ID cannot be null',
        HttpStatus.BAD_REQUEST,
      );
    }
    const member = await this.memberModel.findById(memberId).exec();

    console.log("Found Member", member);

    if (!member) {
      throw new HttpException(
        `Member not found with ID: ${memberId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapToDto(member);
  }

  async getByNicNumber(nicNumber: string): Promise<MemberDto> {
    if (!nicNumber) {
      throw new HttpException(
        'NIC Number cannot be null',
        HttpStatus.BAD_REQUEST,
      );
    }
    const member = await this.memberModel.findOne({ nicNumber }).exec();

    console.log("Found Member", member);

    if (!member) {
      throw new HttpException(
        `Member not found with ID: ${nicNumber}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapToDto(member);
  }

  async update(id: string, memberDto: MemberDto): Promise<MemberDto> {
    if (!id || !memberDto) {
      throw new HttpException(
        'Member ID and data cannot be null',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!memberDto.nicNumber || memberDto.nicNumber.trim() === '') {
      throw new HttpException('NIC number is required', HttpStatus.BAD_REQUEST);
    }
    if (!memberDto.email || memberDto.email.trim() === '') {
      throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
    }

    const existingMember = await this.memberModel.findById(id).exec();
    if (!existingMember) {
      throw new HttpException(
        `Member not found with ID: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (existingMember.nicNumber !== memberDto.nicNumber) {
      const existingNic = await this.memberModel
        .findOne({ nicNumber: memberDto.nicNumber })
        .exec();
      if (existingNic) {
        throw new HttpException(
          `Member with NIC number ${memberDto.nicNumber} already exists`,
          HttpStatus.CONFLICT,
        );
      }
    }
    if (existingMember.email !== memberDto.email) {
      const existingEmail = await this.memberModel
        .findOne({ email: memberDto.email })
        .exec();
      if (existingEmail) {
        throw new HttpException(
          `Member with email ${memberDto.email} already exists`,
          HttpStatus.CONFLICT,
        );
      }
    }

    Object.assign(existingMember, memberDto);
    const updatedMember = await existingMember.save();

    // Create notification for member update
    await this.notificationsService.create({
      message: `Member updated: ${memberDto.name} (${memberDto.email})`,
      type: 'MEMBER_UPDATED',
    });

    return this.mapToDto(updatedMember);
  }

  async deactivate(id: string): Promise<boolean> {
    if (!id) {
      throw new HttpException(
        'Member ID cannot be null',
        HttpStatus.BAD_REQUEST,
      );
    }
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new HttpException(
        `Member not found with ID: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!member.activeStatus) {
      return false;
    }
    member.activeStatus = false;
    await member.save();

    // Create notification for member deactivation
    await this.notificationsService.create({
      message: `Member deactivated: ${member.name} (${member.email})`,
      type: 'MEMBER_DEACTIVATED',
    });

    return true;
  }

  async activate(id: string): Promise<boolean> {
    if (!id) {
      throw new HttpException(
        'Member ID cannot be null',
        HttpStatus.BAD_REQUEST,
      );
    }
    const member = await this.memberModel.findById(id).exec();
    if (!member) {
      throw new HttpException(
        `Member not found with ID: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (member.activeStatus) {
      return false;
    }
    member.activeStatus = true;
    await member.save();

    // Create notification for member activation
    await this.notificationsService.create({
      message: `Member activated: ${member.name} (${member.email})`,
      type: 'MEMBER_ACTIVATED',
    });

    return true;
  }

  async sendQrEmail(request: EmailRequestDto): Promise<string> {
    if (!request.email || !request.qrCode || !request.name) {
      throw new HttpException(
        'Name, Email and QR Code are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Extract base64 content from Data URL
    const base64Data = request.qrCode.replace(
      /^data:image\/png;base64,/,
      '',
    );
    const qrBuffer = Buffer.from(base64Data, 'base64');

    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: request.email,
      subject: 'Your RSK Fitness Access QR Code',
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color:#111; line-height:1.5;">
        <p style="margin:0 0 12px;">Hi ${request.name},</p>

        <p style="margin:0 0 12px;">
          Welcome to <strong>RSK Fitness</strong>! Below is your membership QR code for gym access.
        </p>

        <div style="margin:16px 0; text-align:center;">
          <img
            src="cid:qrCodeInline"
            alt="RSK Fitness QR Code"
            style="width:220px; height:auto; border:1px solid #eee; padding:10px; border-radius:8px;"
          />
        </div>

        <div style="text-align:center; margin:12px 0 18px;">
          <p style="margin:0 0 8px;">
            You can download and save your QR code for easy access.
          </p>
          <p style="margin:0; font-size:14px;">
            📎 <strong>Attached:</strong> RSK-Fitness-QR.png
          </p>
        </div>

        <p style="margin:0 0 12px;">
          <strong>Tip:</strong> You can also take a screenshot of the QR code for faster entry.
        </p>

        <p style="margin:0 0 12px;">
          Please keep this QR code private — it’s linked to your membership.
        </p>

        <p style="margin:0;">
          See you at the gym,<br/>
          <strong>RSK Fitness Team</strong>
        </p>

        <hr style="border:none; border-top:1px solid #eee; margin:18px 0;" />

        <p style="font-size:12px; color:#666; margin:0;">
          If you didn’t request this email, please reply to this message or contact our front desk.
        </p>
      </div>
    `,
      attachments: [
        {
          filename: 'rsk-fitness-qr-inline.png',
          content: qrBuffer,
          cid: 'qrCodeInline',
        },
        {
          filename: 'RSK-Fitness-QR.png',
          content: qrBuffer,
          contentType: 'image/png',
          disposition: 'attachment',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    await this.notificationsService.create({
      message: `QR code email sent to: ${request.email}`,
      type: 'QR_CODE_SENT',
    });

    return 'QR code email sent successfully';
  }

  private mapToDto(member: Member): MemberDto {
    return {
      memberId: member._id.toString(),
      name: member.name,
      age: member.age,
      height: member.height,
      weight: member.weight,
      nicNumber: member.nicNumber,
      email: member.email,
      mobileNumber: member.mobileNumber,
      address: member.address,
      qrCodeData: member.qrCodeData,
      fingerprintData: member.fingerprintData,
      faceImageData: member.faceImageData,
      membershipStartDate: member.membershipStartDate.toISOString(),
      activeStatus: member.activeStatus,
    };
  }
}
