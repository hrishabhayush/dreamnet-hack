import express, { Request, Response } from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import axios from 'axios';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

const PORT = process.env.PORT || process.env.SERVER_PORT || 4000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

// In-memory storage of replies
interface ChatEntry {
  text: string;
  agent: string;
  avatar?: string;
  voiceId?: string;
  summary: string;
  timestamp: string;
}

let lastReply: ChatEntry | null = null;
const history: ChatEntry[] = [];

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

    // ---- Simple forward: send activities to DreamNet agent endpoint ----
    let replyText = 'No reply';
    let agentName = 'Agent';
    let avatar: string | undefined = undefined;
    let voiceId: string | undefined = undefined;

    try {
      const dreamRes = await axios.post(
        `https://hackathon.dreamnet.io/agent/${agentId}/chat`,
        { text: JSON.stringify(activityData) }
      );
      replyText = dreamRes.data?.text ?? JSON.stringify(dreamRes.data);
      agentName = dreamRes.data?.agent?.name || 'Agent';
      avatar = dreamRes.data?.agent?.avatar;
      voiceId = dreamRes.data?.agent?.voiceId;
    } catch (err) {
      console.error('DreamNet agent request failed', err);
      return res.status(502).json({ error: 'Failed to contact DreamNet agent' });
    }

    const entry: ChatEntry = {
      text: replyText,
      agent: agentName,
      avatar,
      voiceId,
      summary: '',
      timestamp: new Date().toISOString(),
    };

    // Store for overlay polling and history
    lastReply = entry;
    history.push(entry);

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

// Full chat history (limited to last 100 messages)
app.get('/history', (_req: Request, res: Response) => {
  res.json(history.slice(-100));
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