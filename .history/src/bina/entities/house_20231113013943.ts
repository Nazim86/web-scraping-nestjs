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
        pricePerSquare = createHouseDto.pricePerSquare,
        price = createHouseDto.price,
        description = createHouseDto.description
        location = 
    }
  }
}

export const HouseSchema = SchemaFactory.createForClass(House);
