import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './security/auth.module';
import { MembersModule } from './member/members.module';
import { NotificationsModule } from './notification/notifications.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PaymentModule } from './payment/payment.module';

import { TypeOrmModule } from '@nestjs/typeorm';
// import { PgPubSubModule } from '@cisstech/nestjs-pg-pubsub';
// import { AttendanceScan } from './attendance/attendance-scan.entity';
import { ReportsModule } from './report/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    // New: PostgreSQL configuration via TypeORM
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     type: 'postgres',
    //     host: configService.get<string>('PG_HOST', 'localhost'),
    //     port: configService.get<number>('PG_PORT', 5433),
    //     username: configService.get<string>('PG_USERNAME', 'postgres'),
    //     password: configService.get<string>('PG_PASSWORD', '12345'),
    //     database: configService.get<string>('PG_DATABASE', 'gym'),
    //     entities: [AttendanceScan],  // Add your PG entities here
    //     synchronize: false,  // Auto-create tables in dev (disable in prod)
    //     logging: true,  // For debugging
    //   }),
    //   inject: [ConfigService],
    // }),
    // New: PgPubSubModule for LISTEN/NOTIFY
    // PgPubSubModule.forRoot({
    //   databaseUrl: `postgresql://${process.env.PG_USERNAME}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`,
    //   queue: {
    //     maxRetries: 5,
    //     messageTTL: 24 * 60 * 60 * 1000,  // 24 hours
    //     cleanupInterval: 60 * 60 * 1000,  // 1 hour
    //   },
    // }),
    AuthModule,
    MembersModule,
    NotificationsModule,
    AttendanceModule,
    PaymentModule,
    ReportsModule,
  ],
})
export class AppModule { }