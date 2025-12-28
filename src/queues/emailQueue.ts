import { Queue } from 'bullmq';
import { redis } from '../lib/redis';

export const emailQueueName = 'email-send-queue';

export const emailQueue = new Queue(emailQueueName, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: 500
  }
});
