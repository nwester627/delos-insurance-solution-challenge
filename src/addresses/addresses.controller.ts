import { Controller, Post, Get, Body, Param, Logger } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto'; // Import this

@Controller('addresses')
export class AddressesController {
  private readonly logger = new Logger(AddressesController.name);

  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Body() createAddressDto: CreateAddressDto) {
    // Use DTO here
    this.logger.log(`Received request for: ${createAddressDto.address}`);
    return this.addressesService.create(createAddressDto.address);
  }

  @Get()
  async findAll() {
    this.logger.log('Retrieving all stored addresses (summary view)');
    const addresses = await this.addressesService.findAll();

    // Spec refinement: Return only id, address, lat, lng for the list view
    return addresses.map((addr) => ({
      id: addr.id,
      address: addr.address,
      latitude: addr.latitude,
      longitude: addr.longitude,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Retrieving full details for ID: ${id}`);
    return this.addressesService.findOne(+id);
  }
}
