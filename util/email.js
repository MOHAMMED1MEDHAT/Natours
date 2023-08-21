const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');
const pug = require('pug');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = process.env.EMAIL_FROM;
    }

    Transporter() {
        if (process.env.NODE_ENV === 'production') {
            //user singrid
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    async send(template, subject) {
        //1- render the html for mail body
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                filename: this.firstName,
                url: this.url,
                subject,
            }
        );
        //2- define mail options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html),
        };
        //3- create a transporter and send email
        await this.Transporter().sendMail(mailOptions);
    }

    sendWelcome() {
        this.send('welcome', 'welcome to our family');
    }
};

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: 'mohamed.medhat2121@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
