// src/scripts/enqueueTest.ts
import { emailQueue } from '../queues/emailQueue';
import crypto from 'crypto';

async function run() {
  console.log('[producer] enqueue test start');

  // Same idempotencyKey for duplicate test
  const idem = 'test-dup-1';

  const common = {
    from: 'alice@example.com',
    to: 'bob@example.com',
    subject: 'Hello from Mailstorm test',
    html: '<b>hi</b>',
    text: 'hi'
  };

  // enqueue duplicates
  for (let i = 0; i < 3; i++) {
    const jobId = `email:${idem}:${i}`; // intentionally different job ids to show dedupe is about dedupeKey
    const payload = { ...common, idempotencyKey: idem, nonce: i };
    const j = await emailQueue.add(jobId, payload);
    console.log('[producer] enqueued duplicate job', jobId, 'bullid=', j.id);
  }

  // enqueue unique ones
  for (let i = 0; i < 3; i++) {
    const uniqueId = 'unique-' + crypto.randomUUID();
    const payload = { ...common, idempotencyKey: uniqueId, nonce: 'u' + i };
    const j = await emailQueue.add(`email:${uniqueId}`, payload);
    console.log('[producer] enqueued unique job', `email:${uniqueId}`, 'bullid=', j.id);
  }

  console.log('[producer] done');
  process.exit(0);
}

run().catch(err => {
  console.error('[producer] error', err);
  process.exit(1);
});
