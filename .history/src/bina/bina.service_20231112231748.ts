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

      let nextPage = 'Növbəti';

      const keyWord = nextPage;

      //

      while (nextPage == 'Növbəti') {
        const y = jschardet.detect('Növbəti');

        console.log(y.encoding);

        console.log('before while', nextPage === 'Növbəti');

        nextPage = await page.$eval(
          '.bottom_pagination .pagination-inner',
          (resultItem) => {
            return resultItem.querySelector('.next')?.textContent;
          },
        );

        console.log('here', nextPage);

        const stringToCheck = nextPage;

        let x = jschardet.detect(stringToCheck);

        console.log(x.encoding);

        console.log(nextPage.toString().trim());

        // Example strings encoded in Windows-1252
        const string1Windows1252 = 'Hello, 你好'; // Replace with your actual string
        const string2Windows1252 = 'Hello, 你好'; // Replace with your actual string

        // Convert the strings to UTF-8
        const utf8String1 = iconv.decode(
          iconv.encode(nextPage, 'utf-8'),
          'utf-8',
        );
        const utf8String2 = iconv.decode(
          iconv.encode(keyWord, 'utf-8'),
          'utf-8',
        );

        console.log(utf8String1 === utf8String2);

        let x = jschardet.detect(stringToCheck);

        console.log(x.encoding);

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