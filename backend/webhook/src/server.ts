import express, { Request, Response } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { ActivityProcessor } from '../../../smart-response/src/services/activityProcessor';
import { ResponseGenerator } from '../../../smart-response/src/services/responseGenerator';
import { validateActivityData } from '../../../smart-response/src/utils/validation';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

const PORT = process.env.PORT || process.env.SERVER_PORT || 4000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

const activityProcessor = new ActivityProcessor();
const responseGenerator = new ResponseGenerator();

// In-memory storage of last agent reply
let lastReply: { text: string; timestamp: string } | null = null;

app.get('/health', (_: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/', async (req: Request, res: Response) => {
  if (!WEBHOOK_SECRET) return res.status(500).send('Webhook secret missing');

  const signature = req.headers['x-signature'] as string | undefined;
  if (!verifySignature(req.body, signature, WEBHOOK_SECRET)) {
    return res.status(403).send('Invalid signature');
  }

  const { activityData, agentId } = req.body;
  try {
    if (!Array.isArray(activityData)) {
      return res.json({ text: 'No activity data', saveModified: false });
    }

    const validated = validateActivityData(activityData);
    const processed = await activityProcessor.process(validated);
    const smart = await responseGenerator.generateResponse(processed, agentId);

    const replyText = smart.agent_response?.message || smart.insights;

    // Store for overlay polling
    lastReply = { text: replyText, timestamp: new Date().toISOString() };

    return res.json({ text: replyText, saveModified: false });
  } catch (err) {
    console.error('Processing error', err);
    return res.status(500).json({ error: 'Processing error' });
  }
});

// Endpoint for overlay to fetch the most recent agent message
app.get('/latest', (_req: Request, res: Response) => {
  if (!lastReply) return res.status(204).send();
  res.json(lastReply);
});

app.listen(PORT, () => {
  console.log(`Webhook running on port ${PORT}`);
});

function verifySignature(body: any, signature: string | undefined, secret: string) {
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  hmac.update(raw);
  const expected = hmac.digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature.trim()), Buffer.from(expected));
  } catch {
    return false;
  }
} 