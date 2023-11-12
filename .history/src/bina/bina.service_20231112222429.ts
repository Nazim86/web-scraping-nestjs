import { Injectable } from '@nestjs/common';
//import { ConfigService } from '@nestjs/config';
//import * as puppeteerCore from 'puppeteer-core';

//import { executablePath } from 'puppeteer';
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

      let nextPage = 'Növbəti';

      const keyWord = 'Növbəti';

      //

      while (nextPage === 'Növbəti') {
        console.log('before while', nextPage);

        console.log('before while', nextPage === 'Növbəti');

        nextPage = await page.$eval(
          '.bottom_pagination .pagination-inner',
          (resultItem) => {
            return resultItem.querySelector('.next')?.textContent;
          },
        );

        nextPage

        console.log(nextPage);

        console.log(typeof nextPage);

        console.log(nextPage === keyWord);

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

        console.log(notNullResults);

        // await this.mailService.sendEmail(notNullResults);

        await Promise.all([page.waitForNavigation(), page.click('.next a')]);
      }
    } finally {
      await browser.close();
    }
  }
}
