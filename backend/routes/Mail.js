import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Create __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent folder
dotenv.config({
    path: path.resolve(__dirname, "../.env"),
});

const mailOptions = (to, subject, html) => ({
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    // text: text,
    html: html,
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection
transporter.verify((err) => {
    if (err) {
        console.error("SMTP Error:", err);
    } else {
        console.log("SMTP Server Ready");
    }
});

// Send mail
function sendOTPEmail(to, subject, html) {
    transporter.sendMail(mailOptions(to, subject, html), (error, info) => {
        if (error) {
            console.error("Error:", error);
        } else {
            console.log("Email Sent:", info.response);
        }
    });
}

export default sendOTPEmail;