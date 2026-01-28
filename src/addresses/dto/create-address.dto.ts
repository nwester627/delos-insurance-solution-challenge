import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    description: 'The physical address to assess',
    example: '1600 Amphitheatre Parkway, Mountain View, CA',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
