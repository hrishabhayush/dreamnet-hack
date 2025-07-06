import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

    
const app = express();
app.use(express.json());

let lastEventTimestamp: string = new Date(Date.now() - 30000).toISOString(); // Start 30 seconds ago


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

                    const mapped = mapEventToActivity(processedEvent);
                    eventBuffer.push(mapped);
                    console.log(`📦 Buffered activity: ${mapped.app} (${mapped.duration}s) – buffer size ${eventBuffer.length}`);
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
    console.log(`🔄 Sending batch of ${eventBuffer.length} activities to webhook`);

    sendActivitiesToWebhook(eventBuffer, webhookTargetUrl);
    // Clear buffer for next window
    eventBuffer.length = 0;
}

function sendActivitiesToWebhook(activityData: any[], webhookTargetUrl: string) {
    const payload = { activityData, agentId: process.env.AGENT_ID || undefined };

    const crypto = require('crypto');
    const payloadStr = JSON.stringify(payload);

    const webhookSecret = process.env.WEBHOOK_SECRET || '';
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(payloadStr);
    const signature = hmac.digest('base64');

    axios.post(webhookTargetUrl, payload, {
        headers: {
            'x-signature': signature,
            'Content-Type': 'application/json'
        }
    })
        .then(() => {
            console.log('✅ Batch forwarded to webhook');
        })
        .catch((error: any) => {
            console.error('❌ Failed to forward batch:', error.message);
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

// Start the service
startBufferService();