import { Injectable } from '@nestjs/common';
import iconv from 'iconv-lite';

import jschardet from 'jschardet';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';

import * as process from 'process';

import puppeteer from 'puppeteer';
import { log } from 'console';

@Injectable()
export class BinaService {
  constructor(
    //private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_11_HOURS)
  async getHouses(price) {
    console.log('cron in bina');

    const browser = await puppeteer.launch({
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--single-process',
        '--no-zygote',
      ],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);

      await Promise.all([
        page.waitForNavigation(),
        page.goto(
          'https://bina.az/baki/alqi-satqi/menziller/yeni-tikili/1-otaqli?location_ids%5B%5D=8&location_ids%5B%5D=34&location_ids%5B%5D=37&location_ids%5B%5D=35&location_ids%5B%5D=38',
        ),
      ]);

      let nextPage = 'next';

      const scrapedArray = [];

      try {
        
      } catch (error) {
        
      }

   
      await this.mailService.sendEmail(notNullResults);
    } finally {
      await browser.close();
    }
  }
}
