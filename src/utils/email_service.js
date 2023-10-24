import nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as path from "path";
import * as fs from "fs";

async function sendEmail(to, subject, text, attachments) {
    const filePath = path.join('src/utils/welcome.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    // const replacements = {
    //     id: "Umut YEREBAKMAZ"                     c
    // };
    const htmlToSend = template();
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: to,
        subject: subject,
        html: htmlToSend,
        text: text,
        attachments: attachments, // Tambahkan lampiran ke email
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
}

export default sendEmail;
