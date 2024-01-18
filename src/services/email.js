import nodemailer from 'nodemailer';
import User from '../models/user.js';

const MAIL_OPTS = {
    from: process.env.SMTP_EMAIL,
    to: '',
    subject: 'Teammate Sync Service',
    text: '',
};

let transporter = null;

/**
 *
 * @param {string[]} emailList
 * @param {string} msg
 */
export async function publishEmail(msg) {
    if (!transporter) {
        console.log('Error: Uninitialized SMTP Server');
        return;
    }

    const emailList = (await User.findAll()).map(x => x.email);
    emailList.forEach(email => {
        let mailOptions = { ...MAIL_OPTS };
        mailOptions.to = email;
        mailOptions.text = msg;

        console.log(`Sending Service Sync Email to: ${email}...`);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error)
                console.log(`Error Sending Service Sync Email to: ${email}`);
            else
                console.log('Email Sent');
        });
    });
}

export function setupSMTP() {
    if (!transporter) {
        try {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                }
            });
            console.log(`Connected to SMTP Server: ${process.env.SMTP_HOST}`);
        } catch (error) { console.log(`Error Connecting to SMTP Server: ${error}`) }
    }
}

setupSMTP();