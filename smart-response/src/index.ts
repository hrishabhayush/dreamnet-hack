import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Placeholder analysis endpoint
app.post('/analyze', (req: any, res: any) => {
  const { activityData } = req.body;
  
  if (!activityData) {
    return res.status(400).json({ error: 'Activity data is required' });
  }

  // For now, return a simple response
  res.json({
    success: true,
    message: 'Smart response service is ready - implementation coming soon',
    received_activities: Array.isArray(activityData) ? activityData.length : 1,
    timestamp: new Date().toISOString()
  });
});

const port = process.env.PORT || 3003;

app.listen(port, () => {
  console.log(`Smart Response service running on port ${port}`);
});

export default app; 