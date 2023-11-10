import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmail(result) {
    //const url = `https://somesite.com/confirm-email?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: 'nazim86@gmail.com',
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Bina.az evler',
      template: './found-houses', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        result,
      },
    });
  }
}
