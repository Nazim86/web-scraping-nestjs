import iconv from 'iconv-lite';

import jschardet from 'jschardet';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';

import * as process from 'process';

import puppeteer from 'puppeteer';
import { log } from 'console';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { House } from './entities/house';

@Injectable()
export class BinaService {
  constructor(
    //private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectModel(House.name) private 
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

      let scrapedArray = [];

      try {
        while (nextPage == 'next') {
          //here we getting next page class name, using this in order to turn till last page,
          //+ when it reaches last page classList will be undefined and loop will end
          nextPage = await page.$eval(
            '.bottom_pagination .pagination-inner',
            (resultItem) => {
              return resultItem.querySelector('.next').classList.value;
            },
          );

          const result = await page.$$eval(
            '.items_list .items-i',
            (resultItems) => {
              return resultItems.map((resultItem) => {
                const priceString = resultItem.querySelector(
                  '.card_params .abs_block .price .price-val',
                )?.textContent;

                const price = Number(priceString.replace(' ', ''));

                const squareString = resultItem.querySelector(
                  '.card_params .name li:nth-child(2)',
                )?.textContent;

                const description =
                  resultItem.querySelector('.card_params .name')?.textContent;

                const location = resultItem.querySelector(
                  '.card_params .location',
                )?.textContent;

                const square = Number(squareString.split(' ')[0]);

                const pricePerSquare = Math.trunc(price / square);

                const url = resultItem.querySelector('a').href;

                if (pricePerSquare < 2100) {
                  return { pricePerSquare, price, description, location, url };
                } else {
                  return null;
                }
                // const title = resultItem.querySelector('.item_link')?.textContent;
              });
            },
          );

          const notNullResults = result.filter((r) => {
            if (r) return r;
          });

          scrapedArray = scrapedArray.concat(notNullResults);

          notNullResults.concat(notNullResults);

          await Promise.all([page.waitForNavigation(), page.click('.next a')]);
        }
      } catch (error) {
        console.log(scrapedArray);

        await this.mailService.sendEmail(scrapedArray);
        return;
      }
      console.log(scrapedArray);

      await this.mailService.sendEmail(scrapedArray);
    } finally {
      await browser.close();
    }
  }
}
