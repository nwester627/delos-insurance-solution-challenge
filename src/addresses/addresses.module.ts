import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address } from './address.entity';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
  imports: [SequelizeModule.forFeature([Address]), HttpModule],
  providers: [AddressesService],
  controllers: [AddressesController],
})
export class AddressesModule {}
