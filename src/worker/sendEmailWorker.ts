// src/worker/sendEmailWorker.ts
import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis';
import { emailQueueName } from '../queues/emailQueue';
import dotenv from 'dotenv';

dotenv.config();
import nodemailer from 'nodemailer';

async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[transporter] using real SMTP from env');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    console.log('[transporter] no SMTP env found — creating test account (ethereal)');
    const testAcct = await nodemailer.createTestAccount();
    const t = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAcct.user,
        pass: testAcct.pass
      }
    });
    console.log('[transporter] ethereal user:', testAcct.user);
    return t;
  }
}

const perSenderKey = (sender: string) => `token:${sender}`;

async function acquireToken(sender: string, maxPerSecond = 5) {
  const key = perSenderKey(sender);
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 1);
  }
  console.log(`[token] ${sender} current=${current} limit=${maxPerSecond}`);
  return current <= maxPerSecond;
}

async function sendMail(transporter: any, payload: any) {
  console.log('[sendMail] sending', { to: payload.to, from: payload.from, subject: payload.subject });
  const info = await transporter.sendMail({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text
  });
  return info;
}

(async () => {
  const transporter = await createTransporter();

  const worker = new Worker(emailQueueName, async (job: Job) => {
    console.log('[worker] job started', job.id, job.name, job.data);

    const p = job.data;
    const sender = p.from || 'default@local';

    // rate limit check
    const allowed = await acquireToken(sender, Number(process.env.SENDER_RPS || 5));
    if (!allowed) {
      console.log('[worker] rate limited, throwing to let BullMQ retry/backoff');
      throw new Error('Rate limited, retry later');
    }

    // dedupe
    if (p.idempotencyKey) {
      const dedupeKey = `dedupe:${p.idempotencyKey}`;
      const setRes = await redis.setnx(dedupeKey, '1'); // 1 if set, 0 if existed
      if (setRes === 1) {
        await redis.expire(dedupeKey, 3600);
        console.log('[dedupe] set dedupe key', dedupeKey);
      } else {
        console.log('[dedupe] duplicate detected, skipping send for', p.idempotencyKey);
        return { skipped: true, reason: 'duplicate' };
      }
    }

    // send
    try {
      const info = await sendMail(transporter, p);
      console.log('[worker] send success:', info.messageId || info.response || '(no id)');

      // If using Ethereal, provide preview URL:
      if (nodemailer.getTestMessageUrl(info)) {
        console.log('[worker] preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { sent: true, messageId: info.messageId };
    } catch (err) {
      console.error('[worker] send error', err);
      throw err;
    }
  }, { connection: redis });

  worker.on('completed', (job) => console.log('[worker:on] job completed', job.id));
  worker.on('failed', (job, err) => console.log('[worker:on] job failed', job?.id, err?.message));
  console.log('[worker] worker created and listening on queue:', emailQueueName);
})();
