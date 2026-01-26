import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AddressesModule } from './addresses/addresses.module';
import { Address } from './addresses/address.entity';

@Module({
  imports: [
    // Load .env first
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Use forRootAsync to wait for ConfigService to load variables
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadModels: true,
        synchronize: true, // Auto-creates tables (turn off in real production!)
        models: [Address],
      }),
    }),
    AddressesModule,
  ],
})
export class AppModule {}
