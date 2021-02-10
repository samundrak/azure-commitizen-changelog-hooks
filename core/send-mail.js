const { raw } = require("express");
const Mail = require("./mail/Mail");
const NodeMailer = require("./mail/Nodemailer");
const Sendgrid = require("./mail/Sendgrid");

module.exports = async (rawHTML, subject, to, fromLabel) => {
  const mail = new Mail(new NodeMailer());
  await mail.send({
    html: rawHTML,
    subject,
    to,
    fromLabel,
  });
  return true;
};
