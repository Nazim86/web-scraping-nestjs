import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { HouseDto } from '../house.dto';

export type HouseDocument = HydratedDocument<House>;

export type HouseModelStaticType = {
  createHouseHistory: (
    createHouseDto: HouseDto,
    HouseModel: HouseModelType,
  ) => HouseDocument;
};

export type HouseModelType = Model<House> & HouseModelStaticType;

@Schema()
export class House {
  @Prop({ required: true, unique: true })
  _id: string;

  @Prop({ required: true })
  pricePerSquare: number;

  @Prop()
  price: number;

  @Prop()
  description: string;

  @Prop()
  location: string;

  @Prop()
  url: string;

  @Prop({
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now,
  })
  createdAt: Date;

  static createHouseHistory(
    createHouseDto: HouseDto,
    HouseModel: HouseModelType,
  ) {
    const newHouseHistory = {
      announceNumber: createHouseDto.announceNumber,
      pricePerSquare: createHouseDto.pricePerSquare,
      price: createHouseDto.price,
      description: createHouseDto.description,
      location: createHouseDto.location,
      url: createHouseDto.url,
    };

    return new HouseModel(newHouseHistory);
  }
}

export const HouseSchema = SchemaFactory.createForClass(House);

const houseStaticMethods = { createHouseHistory: House.createHouseHistory };

//CommentSchema.methods = { updateComment: Comment.prototype.updateComment };

HouseSchema.statics = houseStaticMethods;
