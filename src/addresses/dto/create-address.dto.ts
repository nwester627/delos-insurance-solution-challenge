import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  @MinLength(5, { message: 'Address is too short' })
  address: string;
}
