import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User } from './entity/user.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly otpStore: Map<string, { otp: string; expires: number }> =
    new Map();

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userModel.findOne({ email: loginDto.email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // @ts-ignore
    const payload = { email: user.email, sub: user._id.toString() };
    const token = this.jwtService.sign(payload);

    return { user, token };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    this.otpStore.set(email, { otp, expires });
    return otp;
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false, // Use TLS
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async validateOtp(email: string, otp: string): Promise<boolean> {
    const stored = this.otpStore.get(email);
    if (!stored || stored.expires < Date.now()) {
      this.otpStore.delete(email);
      return false;
    }
    return stored.otp === otp;
  }

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    this.otpStore.delete(email);
    return true;
  }

  async seedUser(): Promise<void> {
    const email = this.configService.get<string>('DEFAULT_USER_EMAIL');
    const password = this.configService.get<string>('DEFAULT_USER_PASSWORD');
    const username = this.configService.get<string>('DEFAULT_USER_USERNAME');

    if (!email || !password || !username) {
      throw new Error('Default user credentials are not defined in .env');
    }

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({
        email,
        password: hashedPassword,
        username,
      });
      await user.save();
    }
  }
}