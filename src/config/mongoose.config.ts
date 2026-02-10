import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const MongooseConfig = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  MongooseModule.forRootAsync({
    useFactory: () => ({
      uri: process.env.MONGO_URI,
    }),
  }),
];
