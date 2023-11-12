import { Module } from '@nestjs/common';
import { BinaController } from './bina.controller';
import { BinaService } from './bina.service';
import { MailService } from '../mail/mail.service';

const mongooseModels

@Module({
  //imports: [MailModule], //new
  controllers: [BinaController],
  providers: [BinaService, MailService],
})
export class BinaModule {}
