import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { HouseDto } from '../house.dto';

export type HouseDocument = HydratedDocument<House>;

export type HouseModelStaticType = {
  createHouseHistory: (
    createHouseDto: HouseDto,
    postId: string,
    userId: string,
    userLogin: string,
    CommentModel: CommentModelType,
    title: string,
    blogId: string,
    blogName: string,
    blogOwnerId: string,
  ) => CommentDocument;
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
}

export const HouseSchema = SchemaFactory.createForClass(House);
