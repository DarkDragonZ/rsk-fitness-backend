import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { Member, MemberSchema } from './member.schema';
import { NotificationsModule } from '../notification/notifications.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
    NotificationsModule,
  ],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}