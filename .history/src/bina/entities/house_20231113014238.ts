import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { HouseDto } from '../house.dto';

export type HouseDocument = HydratedDocument<House>;

export type HouseModelStaticType = {
  createHouseHistory: (createHouseDto: HouseDto) => HouseDocument;
};

export type HouseModelType = Model<House> & HouseModelStaticType;

@Schema()
export class House {

    @Prop()
    anounceNumber: string;

  @Prop()
  pricePerSquare: number;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  location: string;

  @Prop()
  url: string;

  static createHouseHistory(createHouseDto: HouseDto) {
    const newHouseHistory = {
        anounceNumber: createHouseDto.anounceNumber,
        pricePerSquare: createHouseDto.pricePerSquare,
        price = createHouseDto.price,
        description = createHouseDto.description
        location = createHouseDto.location
    }
  }
}

export const HouseSchema = SchemaFactory.createForClass(House);
