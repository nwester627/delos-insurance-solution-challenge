import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Address } from './address.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address)
    private addressModel: typeof Address,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(addressStr: string) {
    // 1. Get Geocoding Data from Google
    const geoData = await this.getGeocoding(addressStr);

    // 2. Placeholder for NASA Wildfire Data
    const wildfireInfo = await this.getWildFireData(geoData.lat, geoData.lng);

    // 3. Save everything to the database
    return this.addressModel.create({
      address: geoData.formattedAddress,
      latitude: geoData.lat,
      longitude: geoData.lng,
      wildfireData: wildfireInfo,
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
  private async getWildFireData(lat: number, lng: number) {
    const apiKey = this.configService.get<string>('NASA_FIRMS_API_KEY');

    const area = `${lng - 0.5}, ${lat - 0.5}, ${lng + 0.5}, ${lat + 0.5}`;

    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/MODIS_C6_1/${area}/1`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));

      const lines = response.data
        .split('\n')
        .filter((line) => line.trim().length > 0);
      const fireCount = lines.length - 1;

      return {
        active_fires_in_zone: fireCount,
        risk_level: fireCount > 0 ? 'High' : 'Low',
        search_area: area,
        last_checked: new Date().toISOString(),
        raw_data_summary:
          fireCount > 0
            ? 'Thermal anomalies detected'
            : 'No active fires detected',
      };
    } catch (error) {
      return {
        message: 'NASA API temporarily unavailable',
        error: error.message,
      };
    }
  }

  async findAll() {
    return this.addressModel.findAll();
  }
}
