import axios from "axios";
import qs from "qs";

export const sendTestSMS = async ({
  to,
  message,
}: {
  to: string;
  message: string;
}) => {
  try {
    // Step 1: Authenticate and get userToken
    const authRes = await axios.post(
      process.env.SMS_AUTH_URL!,
      qs.stringify({
        textProfileId: process.env.SMS_TEXT_PROFILE_ID,
        apiToken: process.env.SMS_API_TOKEN,
        eltropyClientId: process.env.SMS_ELTROPY_CLIENT_ID,
        userEmail: process.env.SMS_USER_EMAIL,
        userName: process.env.SMS_USER_NAME,
      }),
      {
        headers: {
          "Accept-Language": "en",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const userToken = authRes.data?.userToken;
    if (!userToken) {
      throw new Error("Authentication failed: No userToken received");
    }

    // Step 2: Send SMS using token
    const sendRes = await axios.post(
      process.env.SMS_SEND_URL!,
      {
        textAction: "TEXT_ALERTS",
        textProfileId: process.env.SMS_TEXT_PROFILE_ID,
        customerMobile: to,
        message: message,
        metaData: {
          customerName: "Test User",
          customerUniqueIdentifier: "ACC-TEST123",
          paymentDueDate: "01-Jan-2020",
          amountDue: "100 USD",
        },
      },
      {
        headers: {
          "Eltropy-Client-ID": process.env.SMS_ELTROPY_CLIENT_ID!,
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    return sendRes.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("SMS Send Error:", err.message);
    } else {
      console.error("SMS Send Unknown Error:", err);
    }
    throw err;
  }
};



/*import twilio from "twilio";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendTestSMS = async ({
  to,
  subject,
  message,
  name,
  type,
  category,
  tags,
}: {
  to: string;
  subject: string;
  message: string;
  name?: string;
  type?: string;
  category?: string;
  tags?: string[];
}) => {
  const composedMessage = `
${subject}
------------------------
${name ? `Name: ${name}\n` : ""}
${type ? `Type: ${type}\n` : ""}
${category ? `Category: ${category}\n` : ""}
${tags?.length ? `Tags: ${tags.join(", ")}\n` : ""}
------------------------
${message}
`.trim();

  return await client.messages.create({
    body: composedMessage,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
};*/
