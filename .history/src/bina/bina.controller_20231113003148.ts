import { Controller, Get, Query } from '@nestjs/common';
import { BinaService } from './bina.service';

@Controller('bina')
export class BinaController {
  constructor(private readonly binaService: BinaService) {}
  @Get('houses')
  getHouses(@Query('price') price: string) {
    const result = this.binaService.getHouses(price);
    //console.log(result);
    return result;
  }
}
