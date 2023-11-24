import { Module } from '@nestjs/common';
import { BinaController } from './api/bina.controller';
import { BinaService } from './application/bina.service';
import { MailService } from '../mail/mail.service';
import { House, HouseSchema } from './entities/house';
import { MongooseModule } from '@nestjs/mongoose';
import { BinaRepository } from './ infrastructure/bina.repository';

const mongooseModels = [{ name: House.name, schema: HouseSchema }];

@Module({
  imports: [MongooseModule.forFeature(mongooseModels)], //new
  controllers: [BinaController],
  providers: [BinaService, MailService, BinaRepository],
})
export class BinaModule {}
