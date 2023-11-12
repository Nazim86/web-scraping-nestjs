export class HouseDto {
  pricePerSquare: number;

  price: number;

  @Prop()
  description: string;

  @Prop()
  location: string;

  @Prop()
  url: string;
}
