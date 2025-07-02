import express from 'express';
import dotenv from 'dotenv';
import { ActivityProcessor } from './services/activityProcessor';
import { ResponseGenerator } from './services/responseGenerator';
import { validateActivityData, validateEnvironment } from './utils/validation';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize services
const activityProcessor = new ActivityProcessor();
const responseGenerator = new ResponseGenerator();

// Validate environment on startup
try {
  validateEnvironment();
  logger.info('Environment validation passed');
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      activityProcessor: 'ready',
      responseGenerator: 'ready',
      agents: 'ready'
    }
  });
});

// Get available agents endpoint
app.get('/agents', (req: any, res: any) => {
  try {
    const agents = responseGenerator.getAvailableAgents();
    res.json({
      success: true,
      data: agents,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available agents',
      timestamp: new Date().toISOString()
    });
  }
});

// Main analysis endpoint with agent personality
app.post('/analyze', async (req: any, res: any) => {
  try {
    const { activityData, agentId } = req.body;
    
    if (!activityData) {
      return res.status(400).json({ 
        success: false,
        error: 'Activity data is required',
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`Starting analysis for ${Array.isArray(activityData) ? activityData.length : 1} activities with agent: ${agentId || 'auto-select'}`);

    // Validate and sanitize activity data
    const validatedData = validateActivityData(activityData);
    logger.info(`Validated ${validatedData.length} activity records`);

    // Process the activity data
    const processedActivity = await activityProcessor.process(validatedData);
    logger.info(`Activity processing complete. Productivity score: ${processedActivity.productivity_score}%`);

    // Generate smart response with agent personality
    const smartResponse = await responseGenerator.generateResponse(processedActivity, agentId);
    logger.info(`Smart response generated with agent: ${smartResponse.agent_response?.agent.name}`);

    res.json({
      success: true,
      data: {
        processed_activity: processedActivity,
        smart_response: smartResponse,
        metadata: {
          total_activities: validatedData.length,
          processing_time: new Date().toISOString(),
          agent_used: smartResponse.agent_response?.agent.name,
          agent_tone: smartResponse.agent_response?.tone
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error in analysis endpoint:', error);
    
    // Return appropriate error response
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: error.message,
        type: 'validation_error',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error during analysis',
        timestamp: new Date().toISOString()
      });
    }
  }
});

// Test endpoint for quick agent testing
app.post('/test-agent', async (req: any, res: any) => {
  try {
    const { agentId } = req.body;
    
    // Create mock activity data for testing
    const mockActivityData = [
      {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        app: 'vscode',
        title: 'Working on amazing project',
        duration: 120,
        category: 'development'
      },
      {
        id: 'test-2',
        timestamp: new Date().toISOString(),
        app: 'chrome',
        title: 'Research for project',
        duration: 45,
        category: 'research'
      }
    ];

    const processedActivity = await activityProcessor.process(mockActivityData);
    const smartResponse = await responseGenerator.generateResponse(processedActivity, agentId);

    res.json({
      success: true,
      data: {
        test_mode: true,
        mock_data: mockActivityData,
        smart_response: smartResponse
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Error in test-agent endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Error testing agent response',
      timestamp: new Date().toISOString()
    });
  }
});

const port = process.env.PORT || 3003;

app.listen(port, () => {
  console.log(`🚀 Smart Response service running on port ${port}`);
  console.log(`🤖 Agents ready: Deysi, Doug, Maxine, Kyle`);
  console.log(`📊 Analysis endpoint: POST /analyze`);
  console.log(`🎭 Test endpoint: POST /test-agent`);
  console.log(`👥 Agents list: GET /agents`);
  console.log(`❤️  Health check: GET /health`);
});

export default app; 