import nodemailer from 'nodemailer';

(async () => {
  const testAcct = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: testAcct.user, pass: testAcct.pass }
  });

  const info = await transporter.sendMail({
    from: '"Dev" <dev@example.com>',
    to: 'you@example.com',
    subject: 'Ethereal test',
    text: 'hello from ethereal test'
  });

  console.log('messageId:', info.messageId);
  console.log('preview URL:', nodemailer.getTestMessageUrl(info));
})();
