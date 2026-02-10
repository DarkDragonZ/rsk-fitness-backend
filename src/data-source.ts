import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// import { AttendanceScan } from './attendance/attendance-scan.entity';

const PG_PORT = parseInt(process.env.PG_PORT || '5432', 10);

// Note: Do not call config() here; let ConfigModule handle it in app.module.ts
export default new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'postgres', 
  port: PG_PORT, 
  username: process.env.PG_USERNAME || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'gym',
  // entities: [AttendanceScan],
  migrations: ['dist/migrations/*.js'],
  synchronize: process.env.NODE_ENV !== 'production', 
  logging: process.env.NODE_ENV !== 'production', 
});