import { Controller, Post, Get, Body } from '@nestjs/common';
import { AddressesService } from './addresses.service';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Body('address') address: string) {
    // This takes the 'address' string from your request body
    // and sends it to the service we wrote earlier.
    return this.addressesService.create(address);
  }

  @Get()
  async findAll() {
    // This allows you to see all saved addresses in your browser
    return this.addressesService.findAll();
  }
}
