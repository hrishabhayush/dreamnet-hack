import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

    
const app = express();
app.use(express.json());

let lastEventTimestamp: string = new Date(Date.now() - 30000).toISOString(); // Start 30 seconds ago

// Cache of the most recent agent reply for the overlay service
let lastAgentReply: { text: string; avatar?: string; voiceId?: string; timestamp: string } | null = null;

function startBufferService() {
    // Initialize express server on BUFFER_PORT    
    const port = process.env.BUFFER_PORT || 3000;
    const activityWatchUrl = process.env.ACTIVITYWATCH_API_URL || "http://localhost:5600/api";
    const webhookTargetUrl = process.env.WEBHOOK_TARGET_URL || "http://localhost:4000";
    
    // Initialize current state tracking
    let currentState = {
        currentApp: '',
        currentWebsite: '',
        sessionDuration: 0,
        isIdle: false,
        lastEventTime: new Date()
    };
    
    let eventBuffer: any[] = [];
    const bufferTimeWindow = 30000; // 30-second aggregation window
    const pollingInterval = 2000; // Poll every 2 seconds for immediate response
    
    // Setup ActivityWatch API connection test
    axios.get(`${activityWatchUrl}/0/info`)
    .then(function (response) {
        console.log('✅ Connected to ActivityWatch API');
        console.log('ActivityWatch info:', response.data);
        
        // Start polling for events after successful connection
        startActivityWatchPolling(activityWatchUrl, eventBuffer, currentState, webhookTargetUrl);
    })
    .catch(function (error) {
        console.error('❌ Failed to connect to ActivityWatch API:', error.message);
    });
    
    // Setup webhook target URL validation
    axios.get(webhookTargetUrl)
    .then(function (response) {
        console.log('✅ Webhook target URL is reachable');
    })
    .catch(function (error) {
        console.log('⚠️ Webhook target URL not reachable (this is normal if webhook server is not running)');
    });
    
    // Keep the POST endpoint for manual testing
    app.post('/activity', (req, res) => {
        receiveActivityEvent(req.body, eventBuffer, currentState, webhookTargetUrl);
        res.status(200).json({ status: 'received' });
    });
    
    // Start listening for incoming events
    app.listen(port, () => {
        console.log(`🚀 Buffer service started on port ${port}`);
        console.log(`📡 Polling ActivityWatch every ${pollingInterval/1000} seconds`);
        console.log(`🎯 Forwarding filtered events to: ${webhookTargetUrl}`);
    });
    
    // Setup periodic buffer processing
    setInterval(() => {
        if (eventBuffer.length > 0) {
            processEventWindow(eventBuffer, currentState, webhookTargetUrl);
        }
    }, bufferTimeWindow);
}

async function startActivityWatchPolling(activityWatchUrl: string, eventBuffer: any[], currentState: any, webhookTargetUrl: string) {
    console.log('🔄 Starting ActivityWatch polling...');
    
    setInterval(async () => {
        try {
            await pollActivityWatchData(activityWatchUrl, eventBuffer, currentState, webhookTargetUrl);
        } catch (error) {
            console.error('❌ Polling error:', error);
        }
    }, 2000); // Poll every 2 seconds
}

async function pollActivityWatchData(activityWatchUrl: string, eventBuffer: any[], currentState: any, webhookTargetUrl: string) {
    try {
        // Get available buckets
        const bucketsResponse = await axios.get(`${activityWatchUrl}/0/buckets/`);
        const buckets = bucketsResponse.data;
        
        // Find relevant buckets (window watcher, web watcher, afk watcher)
        for (const bucketId in buckets) {
            const bucket = buckets[bucketId];
            
            // Get recent events from this bucket
            const eventsResponse = await axios.get(
                `${activityWatchUrl}/0/buckets/${bucketId}/events?start=${lastEventTimestamp}&limit=100`
            );
            
            const events = eventsResponse.data;
            
            if (events.length > 0) {
                console.log(`📥 Found ${events.length} new events from ${bucketId}`);
                
                // Process each event
                for (const event of events) {
                    console.log(`📋 Raw event:`, JSON.stringify(event, null, 2));
                    const processedEvent = {
                        bucketId,
                        timestamp: event.timestamp,
                        duration: event.duration,
                        data: event.data,
                        eventType: determineBucketType(bucketId),
                        appName: event.data?.app || '',
                        windowTitle: event.data?.title || '',
                        url: event.data?.url || '',
                        idleStatus: event.data?.status === 'afk'
                    };
                    
                    maintainCurrentState(processedEvent, currentState);

                    // Push the unmodified event so that the exact activity log is sent to the agent
                    eventBuffer.push(event);
                    console.log(`📦 Buffered raw activity – buffer size ${eventBuffer.length}`);
                }
                
                // Update last timestamp
                lastEventTimestamp = new Date().toISOString();
            }
        }
    } catch (error) {
        console.error('❌ Failed to poll ActivityWatch data:', error);
    }
}

function determineBucketType(bucketId: string): string {
    if (bucketId.includes('window')) return 'window';
    if (bucketId.includes('web')) return 'web';
    if (bucketId.includes('afk')) return 'afk';
    return 'unknown';
}

function receiveActivityEvent(rawEvent: any, eventBuffer: any[], currentState: any, webhookTargetUrl: string) {
    // Validate incoming event data
    if (!rawEvent || !rawEvent.timestamp) {
        console.warn('Invalid event received:', rawEvent);
        return;
    }
    
    // Add timestamp if missing
    if (!rawEvent.timestamp) {
        rawEvent.timestamp = new Date().toISOString();
    }
    
    // Store in temporary event buffer
    eventBuffer.push(rawEvent);
    console.log(`📥 Event buffered: ${rawEvent.appName || 'unknown'} - ${rawEvent.eventType || 'unknown'} - Buffer size: ${eventBuffer.length}`);
}

function processEventWindow(eventBuffer: any[], currentState: any, webhookTargetUrl: string) {
    if (eventBuffer.length === 0) return;
    console.log(`🔄 Sending batch of ${eventBuffer.length} activities to agent API`);

    // Forward the raw buffer to the agent API instead of the local webhook
    sendActivitiesToAgent(eventBuffer, webhookTargetUrl);
    // Clear buffer for next window
    eventBuffer.length = 0;
}

/**
 * Send the raw activity data chunk to the Doodles Agents API and
 * print the agent\'s reply to the console. Runs every 30 seconds.
 */
function sendActivitiesToAgent(activityData: any[], _webhookTargetUrl: string) {
    const agentId = process.env.AGENT_ID;
    const apiBase = process.env.AGENTS_API_URL || 'https://agents-api.doodles.app';
    const miniAppId = process.env.MINI_APP_ID;
    const miniAppSecret = process.env.MINI_APP_SECRET;

    if (!agentId) {
        console.error('❌ AGENT_ID env var missing – cannot send to agent');
        return;
    }
    if (!miniAppId || !miniAppSecret) {
        console.error('❌ MINI_APP_ID or MINI_APP_SECRET env vars missing – cannot authenticate');
        return;
    }

    const url = `${apiBase}/${agentId}/user/message`;

    axios.post(
        url,
        { text: JSON.stringify(activityData) },
        {
            headers: {
                'Content-Type': 'application/json',
                'x-mini-app-id': miniAppId,
                'x-mini-app-secret': miniAppSecret,
            },
            timeout: 30000, // 30-second timeout in case of network issues
        }
    )
        .then((response) => {
            // Extract readable text from the agent API (sometimes returns JSON string)
            let raw = response.data?.text ?? response.data;
            let replyText: string;

            if (typeof raw === 'string') {
                // Try to parse JSON string e.g. "[ { text: '...', user: '...' } ]"
                try {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].text) {
                        replyText = parsed[0].text as string;
                    } else if (typeof parsed === 'string') {
                        replyText = parsed;
                    } else {
                        replyText = raw;
                    }
                } catch {
                    replyText = raw; // not JSON, keep as-is
                }
            } else if (Array.isArray(raw) && raw.length > 0 && raw[0].text) {
                // Raw is already parsed array
                replyText = raw[0].text as string;
            } else {
                replyText = JSON.stringify(raw);
            }

            console.log('🗨️  Agent response:', replyText);

            // Store for overlay polling
            lastAgentReply = {
                text: replyText,
                avatar: response.data?.agent?.avatar,
                voiceId: response.data?.agent?.voiceId,
                timestamp: new Date().toISOString(),
            };
        })
        .catch((error: any) => {
            if (error.response) {
                console.error('❌ Agent API error:', error.response.status, error.response.data);
            } else {
                console.error('❌ Failed to contact agent API:', error.message);
            }
        });
}

function mapEventToActivity(event: any) {
    return {
        id: String(event.id ?? Date.now()),
        timestamp: event.timestamp ?? new Date().toISOString(),
        app: event.appName || event.data?.app || 'Unknown',
        title: event.windowTitle || event.data?.title || '',
        url: event.url || event.data?.url,
        duration: Math.round(event.duration || 0),
        category: undefined
    };
}

function maintainCurrentState(event: any, currentState: any) {
    if (event.appName) currentState.currentApp = event.appName;
    if (event.url) currentState.currentWebsite = event.url;
    if (event.idleStatus !== undefined) currentState.isIdle = event.idleStatus;
    currentState.lastEventTime = new Date();
}

// Endpoint for Electron overlay to fetch the latest agent reply
app.get('/latest', (_req: any, res: any) => {
    if (!lastAgentReply) return res.status(204).send();
    res.json(lastAgentReply);
});

// Start the service
startBufferService();