const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url, book) {
    this.to = user.email;
    this.fullName = user.fullName;
    this.url = url;
    if (book) this.bookTitle = book.bookTitle;
    if (book)
      this.approvingStatus = `${book.approvingStatus
        .charAt(0)
        .toUpperCase()}${book.approvingStatus.slice(1)}`;
    this.form = `BookSharing - Customers Service <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   //SendGrid transporter
    //   return 1;
    // }
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      service: process.env.SERVICE,
      secure: Boolean(process.env.SECURE),
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    return transport;
  }

  //send method
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../templates/${template}.pug`, {
      fullName: this.fullName,
      url: this.url,
      bookTitle: this.bookTitle,
      approvingStatus: this.approvingStatus,
      subject,
    });

    //2) Define the email options
    const mailOptions = {
      from: this.form,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendVerificationEmail() {
    await this.send(
      'verificationEmail',
      'BookSharing - Email Verification Required'
    );
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'BookSharing - Account Password Reset');
  }

  async sendBookApprovingStatus() {
    await this.send(
      'bookApprovingStatus',
      'BookSharing - Book Approving Status Notification'
    );
  }
};
