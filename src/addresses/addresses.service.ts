import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Address } from './address.entity';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @InjectModel(Address)
    private addressModel: typeof Address,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(addressStr: string) {
    try {
      this.logger.log(`Starting processing for: ${addressStr}`);

      // 1. Get Geocoding Data
      const geoData = await this.getGeocoding(addressStr);

      // 2. Get NASA Wildfire Data
      const wildfireInfo = await this.getWildFireData(geoData.lat, geoData.lng);

      // 3. UPSERT Logic: Find by formatted address or create new
      // This prevents duplicates based on the "Official" address from Google
      const [record, created] = await this.addressModel.upsert({
        address: geoData.formattedAddress, // Use the cleaned address from Google as the key
        latitude: geoData.lat,
        longitude: geoData.lng,
        wildfireData: wildfireInfo,
      });

      this.logger.log(
        created
          ? `New record created: ${record.id}`
          : `Existing record updated: ${record.id}`,
      );
      return record;
    } catch (error) {
      this.logger.error(
        `Failed to process address: ${addressStr}`,
        error.stack,
      );
      throw error;
    }
  }

  async findOne(id: number) {
    const address = await this.addressModel.findByPk(id);
    if (!address) {
      this.logger.warn(`Search failed: Address with ID ${id} not found`);
      throw new HttpException('Address not found', HttpStatus.NOT_FOUND);
    }
    return address;
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
