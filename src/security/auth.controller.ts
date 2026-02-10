import { Body, Controller, HttpStatus, Post, Res, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from 'express';

@Controller('api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { user, token } = await this.authService.login(loginDto);
      this.logger.log(`User login successful: ${loginDto.email}`);
      return res.status(HttpStatus.OK).json({
        username: user.username,
        email: user.email,
        token,
      });
    } catch (error) {
      this.logger.warn(`Login failed for email: ${loginDto.email}, Error: ${error.message}`);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: error.message || 'Invalid email or password',
      });
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Res() res: Response) {
    try {
      const user = await this.authService.findUserByEmail(forgotPasswordDto.email);
      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'User with this email not found',
        });
      }
      const otp = await this.authService.generateOtp(forgotPasswordDto.email);
      await this.authService.sendOtpEmail(forgotPasswordDto.email, otp);
      this.logger.log(`OTP sent to ${forgotPasswordDto.email}`);
      return res.status(HttpStatus.OK).json({
        message: 'OTP sent to email',
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${forgotPasswordDto.email}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to send OTP email',
      });
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
    try {
      const isValidOtp = await this.authService.validateOtp(
        resetPasswordDto.email,
        resetPasswordDto.otp,
      );
      if (!isValidOtp) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid or expired OTP',
        });
      }
      const success = await this.authService.resetPassword(
        resetPasswordDto.email,
        resetPasswordDto.newPassword,
      );
      if (!success) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to reset password',
        });
      }
      this.logger.log(`Password reset successful for ${resetPasswordDto.email}`);
      return res.status(HttpStatus.OK).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      this.logger.error(`Error resetting password for ${resetPasswordDto.email}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Failed to reset password',
      });
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    this.logger.log('User logged out');
    return res.status(HttpStatus.OK).json({
      message: 'Logout successful. Please discard the JWT token on the client side.',
    });
  }
}