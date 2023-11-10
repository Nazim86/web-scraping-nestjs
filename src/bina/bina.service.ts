import { Injectable } from '@nestjs/common';
//import { ConfigService } from '@nestjs/config';
import * as puppeteerCore from 'puppeteer-core';

//import { executablePath } from 'puppeteer';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';

//import { Cron, CronExpression } from '@nestjs/schedule';

import puppeteer from 'puppeteer';
import * as awsLambdaChrome from 'chrome-aws-lambda';

let chrome: any = {};
let puppeteerInstance: any;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = awsLambdaChrome;
  puppeteerInstance = puppeteerCore.puppeteer;
} else {
  puppeteerInstance = puppeteer;
}

@Injectable()
export class BinaService {
  constructor(
    //private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async getHouses(price) {
    console.log('cron in bina');
    let options = {};

    if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
      options = {
        args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
      };
    }
    console.log('cron works');
    //const browser = await puppeteerInstance.launch(options);

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

    // {
    //   executablePath: executablePath(),
    //     args: ['--no-sandbox'],
    // }

    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);

      await Promise.all([
        page.waitForNavigation(),
        page.goto(
          'https://bina.az/baki/alqi-satqi/menziller/yeni-tikili?has_repair=true&location_ids%5B%5D=6&location_ids%5B%5D=61&price_to=135000&room_ids%5B%5D=1&room_ids%5B%5D=2',
        ),
      ]);

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

            const location = resultItem.querySelector('.card_params .location')
              ?.textContent;

            const square = Number(squareString.split(' ')[0]);

            const pricePerSquare = Math.trunc(price / square);

            const url = resultItem.querySelector('a').href;

            if (pricePerSquare < 2000) {
              return { pricePerSquare, price, description, location, url };
            } else {
              return null;
            }
            // const title = resultItem.querySelector('.item_link')?.textContent;
          });
        },
      );
      const stringEvler = JSON.stringify(result);
      await this.mailService.sendEmail(stringEvler);
      console.log(stringEvler);
    } finally {
      await browser.close();
    }
  }
}
