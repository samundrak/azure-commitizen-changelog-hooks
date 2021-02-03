const { raw } = require("express");
const Mail = require("./mail/Mail");
const NodeMailer = require("./mail/Nodemailer");
const Sendgrid = require("./mail/Sendgrid");

module.exports = async (rawHTML, subject, to) => {
  const mail = new Mail(new Sendgrid());
  await mail.send({
    html: rawHTML,
    subject,
    to,
  });
  return true;
};
