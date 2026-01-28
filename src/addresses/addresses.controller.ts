import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
  Query,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto'; // Import this

@Controller('addresses')
export class AddressesController {
  private readonly logger = new Logger(AddressesController.name);

  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  async create(@Body() createAddressDto: CreateAddressDto) {
    this.logger.log(`Received request for: ${createAddressDto.address}`);
    return this.addressesService.create(createAddressDto.address);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10, //bonus: pagination implementation
  ) {
    this.logger.log(`Fetching page ${page} with limit ${limit}`);
    return this.addressesService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Retrieving full details for ID: ${id}`);
    return this.addressesService.findOne(+id);
  }
}
