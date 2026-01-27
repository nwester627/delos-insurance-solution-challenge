import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table
export class Address extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare address: string;

  @Column(DataType.FLOAT)
  latitude: number;

  @Column(DataType.FLOAT)
  longitude: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  wildfireData: any;
}
