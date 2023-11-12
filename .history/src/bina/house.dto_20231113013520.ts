export class HouseDto {
  pricePerSquare: number;

  price: number;

  
  description: string;

  @Prop()
  location: string;

  @Prop()
  url: string;
}
