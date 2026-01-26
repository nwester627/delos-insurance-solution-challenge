import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Address } from './address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address)
    private addressModel: typeof Address,
    private readonly httpService: HttpService,
  ) {}

  async create(addressStr: string) {
    // 1. Get Geocoding Data from Google
    const geoData = await this.getGeocoding(addressStr);

    // 2. Placeholder for NASA Wildfire Data
    const wildfireData = { message: 'NASA integration coming next!' };

    // 3. Save to Database
    return this.addressModel.create({
      address: geoData.formattedAddress,
      latitude: geoData.lat,
      longitude: geoData.lng,
      wildfireData: wildfireData,
    });
  }

  private async getGeocoding(address: string) {
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await firstValueFrom(this.httpService.get(url));

    if (response.data.status !== 'OK') {
      throw new HttpException(
        `Geocoding failed: ${response.data.status}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  }

  async findAll() {
    return this.addressModel.findAll();
  }
}
