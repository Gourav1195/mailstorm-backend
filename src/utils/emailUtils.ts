// emailUtils.ts
import axios from "axios";

export const sendTestEmail = async ({
  to,
  subject,
  htmlContent,
  note,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  note?: string;
}) => {
  try {
    const apiKey = process.env.EMAIL_API_KEY;
    const sendUrl = process.env.EMAIL_SEND_URL;

    if (!sendUrl) {
      throw new Error("EMAIL_SEND_URL is not set in environment variables");
    }

    const response = await axios.post(
      sendUrl,
      {
        to,
        subject,
        text: note || "Test email from Marketing Campaigns.",
        html: htmlContent,
        category: "test",
      },
      {
        headers: {
          "X-API-Key": apiKey!,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data?.success) {
      console.error("Email send failed:", response.data.message || response.data);
    }
  } catch (err: any) {
    console.error("Error sending email via third-party API:", err.message);
    throw new Error(`Email sending failed: ${err.message}`);
  }
};


/*import nodemailer from "nodemailer";

export const sendTestEmail = async ({
  to,
  subject,
  htmlContent,
  note,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  note?: string;
}) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Campaign Tester" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <div>
        <p>${note || ""}</p>
        ${htmlContent}
      </div>
    `,
  });
};*/



