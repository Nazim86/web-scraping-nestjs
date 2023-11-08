import { Module } from '@nestjs/common';
import { BinaController } from './bina.controller';
import { BinaService } from './bina.service';

@Module({
  controllers: [BinaController],
  providers: [BinaService],
})
export class BinaModule {}
