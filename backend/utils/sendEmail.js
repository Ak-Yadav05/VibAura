const nodemailer = require("nodemailer");
const { info, error } = require("./logger");

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For Gmail: service: 'gmail', auth: { user: ..., pass: ... }
    // Ideally these should come from process.env
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: process.env.EMAIL_USER || "noreply@vibaura.com",
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: options.html // could add HTML version later
    };

    // 3) Actually send the email
    try {
        await transporter.sendMail(mailOptions);
        info(`Email sent to: ${options.email}`);
    } catch (err) {
        error("Email send failed:", err.message);
        // We log the link anyway in the controller, but we can log failure here too
    }
};

module.exports = sendEmail;
