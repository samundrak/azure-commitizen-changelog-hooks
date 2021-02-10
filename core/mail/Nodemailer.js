const nodemailer = require("nodemailer");
module.exports = class NodeMailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_PORT,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async send(to, subject, content, fromLabel) {
    await this.transporter.sendMail({
      from: `${fromLabel} ${process.env.SENDER_ADDRESS}`,
      to,
      subject,
      html: content,
    });
  }
};
