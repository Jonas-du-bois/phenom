
const WebSocket = require('ws');
const fetch = require('node-fetch');

const WS_URL = 'ws://localhost:3000?token=';
const API_URL = 'http://localhost:3000/api';

// Helper to get token
async function getToken() {
  try {
    const uniqueUser = `testws_${Date.now()}`;
    // Try signup
    let response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: uniqueUser,
            email: `${uniqueUser}@example.com`,
            password: 'Password123!'
        })
    });

    let data = await response.json();
    if (data.token) return data.token;

    // Try login
    response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `${uniqueUser}@example.com`,
                password: 'Password123!'
            })
    });
    data = await response.json();
    return data.token;
  } catch (e) {
      console.error("Error getting token:", e);
      return null;
  }
}

async function verify() {
    console.log("1. Obtaining token...");
    const token = await getToken();
    if (!token) {
        console.error("Failed to get token. Backend might not be running.");
        process.exit(1);
    }
    console.log("Token obtained.");

    console.log("2. Connecting to WebSocket...");
    const ws = new WebSocket(`ws://localhost:3000?token=${token}`);

    const receivedEvents = {
        comment: false,
        observation: false
    };

    ws.on('open', () => {
        console.log("WebSocket Connected.");

        // Subscribe to channels
        ws.send(JSON.stringify({ type: 'sub', channel: 'comments' }));
        ws.send(JSON.stringify({ type: 'sub', channel: 'observations' }));
        console.log("Subscribed to 'comments' and 'observations'.");

        // Trigger API actions
        setTimeout(() => triggerActions(token), 1000);
    });

    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log("Received WebSocket message:", msg);

        if (msg.channel === 'comments' && msg.data && msg.data.type === 'comment:created') {
             console.log("✅ SUCCESS: Received comment:created event!");
             receivedEvents.comment = true;
        }

        if (msg.channel === 'observations' && msg.data && msg.data.type === 'observation:created') {
             console.log("✅ SUCCESS: Received observation:created event!");
             receivedEvents.observation = true;
        }

        if (receivedEvents.comment && receivedEvents.observation) {
            console.log("🎉 ALL TESTS PASSED: Both events received.");
            ws.close();
            process.exit(0);
        }
    });

    ws.on('error', (err) => {
        console.error("WebSocket Error:", err);
    });

    // Timeout safety
    setTimeout(() => {
        console.error("❌ TIMEOUT: Did not receive all events in time.");
        if (!receivedEvents.comment) console.error("- Missing Comment Event");
        if (!receivedEvents.observation) console.error("- Missing Observation Event");
        ws.close();
        process.exit(1);
    }, 15000);
}

async function triggerActions(token) {
    console.log("3. Triggering API actions...");

    // 1. Create Observation
    console.log("Creating Observation...");
    const obsDataPayload = {
        title: `WS Test Obs ${Date.now()}`,
        description: "Testing websocket events",
        date: new Date().toISOString(),
        country: "France",
        type: "UFO",
        location: "Paris"
    };

    const obsResp = await fetch(`${API_URL}/observations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(obsDataPayload)
    });

    if (obsResp.status !== 201) {
        console.error("Failed to create observation", await obsResp.text());
        return;
    }
    const obsData = await obsResp.json();
    const obsId = obsData._id || obsData.id || obsData.data._id;
    console.log(`Observation created: ${obsId}`);

    // 2. Create Comment on that Observation
    console.log(`Creating Comment on ${obsId}...`);
    const commentResp = await fetch(`${API_URL}/observations/${obsId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            text: `WebSocket Test Comment ${Date.now()}`
        })
    });

    if (commentResp.status !== 201) {
        console.error("Failed to create comment", await commentResp.text());
    } else {
        console.log("Comment created via API.");
    }
}

verify();
