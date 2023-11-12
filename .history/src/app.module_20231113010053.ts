import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinaModule } from './bina/bina.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Mongoose } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest')
    ScheduleModule.forRoot(),
    //ConfigModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    BinaModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
