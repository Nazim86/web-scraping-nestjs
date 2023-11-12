import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HouseDocument = HydratedDocument<House>;

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
}

export const HouseSchema = SchemaFactory.createForClass(House);
