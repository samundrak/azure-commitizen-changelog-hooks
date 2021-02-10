module.exports = class Mail {
  constructor(mail) {
    this.mail = mail;
  }

  async send({ to, subject, html, fromLabel }) {
    await this.mail.send(to, subject, html, fromLabel);
  }
};
