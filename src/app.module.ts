import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BinaModule } from './bina/bina.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), BinaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
