import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

//import * as puppeteer from 'puppeteer';
import { executablePath } from 'puppeteer';
import puppeteer from 'puppeteer-core';

@Injectable()
export class BinaService {
  constructor(private readonly configService: ConfigService) {}
  async getHouses(price) {
    const browser = await puppeteer.launch({
      executablePath: executablePath(),
    });
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);

      await Promise.all([
        page.waitForNavigation(),
        page.goto(
          'https://bina.az/baki/alqi-satqi/menziller/yeni-tikili?has_repair=true&location_ids%5B%5D=6&location_ids%5B%5D=61&price_to=135000&room_ids%5B%5D=1&room_ids%5B%5D=2',
        ),
      ]);

      return await page.$$eval('.items_list .items-i', (resultItems) => {
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

          const location = resultItem.querySelector('.card_params .location')
            ?.textContent;

          const square = Number(squareString.split(' ')[0]);

          const pricePerSquare = Math.trunc(price / square);

          const url = resultItem.querySelector('a').href;

          if (pricePerSquare < 2000) {
            console.log(pricePerSquare, price, description, location, url);
            return { pricePerSquare, price, description, location, url };
          }
          // else {
          //   return null;
          // }
          // const title = resultItem.querySelector('.item_link')?.textContent;
        });
      });
    } finally {
      await browser.close();
    }
  }
}
