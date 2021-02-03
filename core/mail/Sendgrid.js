const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = class Sendgrid {
  constructor() {}

  async send(to, subject, content) {
    const msg = {
      to,
      from: process.env.SENDER_ADDRESS,
      subject,
      html: content,
    };
    await global.sgMail.send(msg).catch(console.error);
  }
};
