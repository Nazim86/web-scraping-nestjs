import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../../mail/mail.service';

import * as process from 'process';

import puppeteer from 'puppeteer';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { House, HouseModelType } from '../entities/house';
import { BinaRepository } from '../ infrastructure/bina.repository';

@Injectable()
export class BinaService {
  constructor(
    //private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly binaRepository: BinaRepository,
    @InjectModel(House.name) private HouseModel: HouseModelType,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async getHouses(price) {
    console.log('cron in bina');

    //const houses =

    const browser = await puppeteer.launch({
      headless: 'new',
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

      const binazLink =
        'https://bina.az/baki/alqi-satqi/menziller/kohne-tikili?location_ids%5B%5D=5&location_ids%5B%5D=8&location_ids%5B%5D=6&location_ids%5B%5D=61&location_ids%5B%5D=34&location_ids%5B%5D=2&location_ids%5B%5D=37&location_ids%5B%5D=7&location_ids%5B%5D=59&location_ids%5B%5D=1&location_ids%5B%5D=60&location_ids%5B%5D=35&location_ids%5B%5D=38&location_ids%5B%5D=129&location_ids%5B%5D=130&location_ids%5B%5D=131&location_ids%5B%5D=103&price_to=115000&room_ids%5B%5D=1&room_ids%5B%5D=2';
      //'https://bina.az/baki/alqi-satqi/menziller/yeni-tikili?location_ids%5B%5D=6&location_ids%5B%5D=61&location_ids%5B%5D=1&location_ids%5B%5D=129&location_ids%5B%5D=130&price_to=110000&room_ids%5B%5D=1&room_ids%5B%5D=2';
      //https://bina.az/baki/alqi-satqi/menziller/yeni-tikili?has_bill_of_sale=true&location_ids%5B%5D=8&location_ids%5B%5D=34&location_ids%5B%5D=37&location_ids%5B%5D=35&location_ids%5B%5D=38&price_to=140000&room_ids%5B%5D=1&room_ids%5B%5D=2'

      await Promise.all([page.waitForNavigation(), page.goto(binazLink)]);

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

                const floorString = `${description}`.split('/')[1];
                const floor = Number(`${floorString}`.split(' ')[0]);

                const location = resultItem.querySelector(
                  '.card_params .location',
                )?.textContent;

                const square = Number(`${squareString}`.split(' ')[0]); //

                const pricePerSquare = Math.trunc(price / square);

                const url = resultItem.querySelector('a')?.href;

                const splitUrl = `${url}`.split('/');

                const announceNumber = splitUrl[splitUrl.length - 1];

                //console.log(announceNumber);

                if (floor > 5) {
                  return {
                    _id: announceNumber,
                    pricePerSquare,
                    floor,
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
        console.log(scrapedArray);

        await this.binaRepository.createHouseHistory(scrapedArray);

        //await this.HouseModel.insertMany(scrapedArray, { ordered: false });

        //await this.mailService.sendEmail(newAnnouncedHouses);

        const hourAgo = new Date();
        hourAgo.setHours(hourAgo.getHours() - 1);

        const newAnnouncedHouses = await this.HouseModel.find({
          createdAt: { $gte: hourAgo },
        });

        const userView = newAnnouncedHouses.map((h) => {
          return {
            pricePerSquare: h.pricePerSquare,
            floor: h.floor,
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
      //console.log(scrapedArray);
    } finally {
      await browser.close();
    }
  }
}
