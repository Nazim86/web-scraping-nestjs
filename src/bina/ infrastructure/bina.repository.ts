import { Injectable } from '@nestjs/common';
import { House, HouseModelType } from '../entities/house';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BinaRepository {
  constructor(@InjectModel(House.name) private HouseModel: HouseModelType) {}

  async createHouseHistory(createHouseHistoryDto: House[]) {
    try {
      const result = await this.HouseModel.insertMany(createHouseHistoryDto, {
        ordered: false,
      });

      return result;
    } catch (e) {
      console.log(e);
      return;
    }
  }
}
