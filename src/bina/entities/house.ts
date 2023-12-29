import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { HouseDto } from '../house.dto';
import moment from 'moment-timezone';

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
  floor: number;

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
    default: moment.tz(Date.now(), 'Asia/Baku'),
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
