import  {IncomingForm} from 'formidable';
import sendEmail from "@/utils/email_service";
import * as fs from "fs";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const form = new IncomingForm();
            await form.parse(req, async (err, fields, files) => {
                if (err) {
                    console.error('Error parsing form data:', err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                const { to, subject, text } = fields;
                // Proses lampiran jika ada
                let attachments = [];
                if (files.attachments) {
                    if (Array.isArray(files.attachments)) {
                        // Jika lebih dari satu file terkirim
                        attachments = files.attachments.map(file => {
                            const data = fs.readFileSync(file.filepath , 'utf8');

                            return {
                                filename: file.originalFilename,
                                content: data.split("base64,")[1],
                                encoding: 'base64'                            }
                        });
                    } else {
                        // Jika hanya satu file terkirim
                        const data = fs.readFileSync(files.attachments.filepath , 'utf8');

                        attachments = [{
                            filename: files.attachments.originalFilename,
                            content: data.split("base64,")[1],
                            encoding: 'base64'
                        }];
                    }
                }
                sendEmail(to[0], subject[0], text[0], attachments);

                // if (emailSent) {
                    return res.status(200).json({ message: 'Email sent successfully' });
                // } else {
                //     return res.status(500).json({ error: 'Failed to send email' });
                // }
            });
        } catch (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}

export const config = {
    api: {
        bodyParser: false,

    }
}