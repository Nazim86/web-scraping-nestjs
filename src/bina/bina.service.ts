import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';

import * as process from 'process';

import puppeteer from 'puppeteer';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { House, HouseModelType } from './entities/house';

@Injectable()
export class BinaService {
  constructor(
    //private readonly configService: ConfigService,
    private readonly mailService: MailService,
    @InjectModel(House.name) private HouseModel: HouseModelType,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async getHouses(price) {
    console.log('cron in bina');

    //const houses =

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
          'https://bina.az/baki/alqi-satqi/menziller/yeni-tikili?location_ids%5B%5D=8&location_ids%5B%5D=37&location_ids%5B%5D=35&location_ids%5B%5D=38&price_to=135000&room_ids%5B%5D=1&room_ids%5B%5D=2',
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
            nextPage,
          );
          //console.log(nextPage);

          const result = await page.$$eval(
            '.items_list .items-i',
            (resultItems) => {
              return resultItems.map((resultItem) => {
                const priceString = resultItem
                  .querySelector('.card_params .abs_block .price .price-val')
                  ?.textContent.toString();

                const price = Number(`${priceString}`.replace(' ', '')); //;

                const squareString = resultItem.querySelector(
                  '.card_params .name li:nth-child(2)',
                )?.textContent;

                const description =
                  resultItem.querySelector('.card_params .name')?.textContent;

                const location = resultItem.querySelector(
                  '.card_params .location',
                )?.textContent;

                const square = Number(`${squareString}`.split(' ')[0]); //

                const pricePerSquare = Math.trunc(price / square);

                const url = resultItem.querySelector('a')?.href;

                const splitUrl = `${url}`.split('/');

                const announceNumber = splitUrl[splitUrl.length - 1];

                //console.log(announceNumber);

                if (pricePerSquare < 5000) {
                  return {
                    _id: announceNumber,
                    pricePerSquare,
                    price,
                    description,
                    location,
                    url,
                  };
                } else {
                  return null;
                }
              });
            },
          );

          //console.log('result', result);
          // console.log(typeof result[0].priceString);
          //
          // console.log(jschardet.detect(result[0].priceString));
          const notNullResults = result.filter((r) => {
            if (r) return r;
          });

          scrapedArray = scrapedArray.concat(notNullResults);

          //notNullResults.concat(notNullResults);

          await Promise.all([page.waitForNavigation(), page.click('.next a')]);
        }
      } catch (error) {
        //console.log(error);
        //console.log(scrapedArray);
        try {
          await this.HouseModel.insertMany(scrapedArray, { ordered: false });

          //await this.mailService.sendEmail(newAnnouncedHouses);
        } catch (e) {
          console.log(e);

          const fiveHoursAgo = new Date();
          fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 1);

          const newAnnouncedHouses = await this.HouseModel.find({
            createdAt: { $gte: fiveHoursAgo },
          });

          const userView = newAnnouncedHouses.map((h) => {
            return {
              pricePerSquare: h.pricePerSquare,
              price: h.price,
              description: h.description,
              location: h.location,
              url: h.url,
            };
          });

          console.log('newAnnouncedHouses', userView);

          if (newAnnouncedHouses.length > 0) {
            await this.mailService.sendEmail(userView);
          }
        }
      }
      //console.log(scrapedArray);
    } finally {
      await browser.close();
    }
  }
}
