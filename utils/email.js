const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // create a transporeter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    })

    // define the email options
    const mailOptions = {
        from: 'Amela Korjenic <amela_korjenic@hotmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    // actually send email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;