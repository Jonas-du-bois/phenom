# WebSocket Integration

Phenom implements real-time updates using WebSocket technology with the **WsMini** library. This allows users to receive instant notifications when new observations or comments are created.

## Overview

The WebSocket integration provides a publish/subscribe (PubSub) pattern where:
- The **server** publishes events when data changes
- **Clients** subscribe to channels to receive updates
- Updates happen in real-time without polling

## Technology

**Library**: [WsMini 1.2.0](https://github.com/Chabloz/WsMini)
- Lightweight WebSocket library
- PubSub pattern support
- Automatic reconnection
- CORS support
- Server-only publishing (security)

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   Backend Server                     │
│  ┌────────────────────────────────────────────────┐ │
│  │         WsMini WebSocket Server                │ │
│  │  ┌──────────────┬──────────────────────────┐  │ │
│  │  │  Channel:    │  Channel:                │  │ │
│  │  │ observations │  comments                │  │ │
│  │  │              │                          │  │ │
│  │  │ • created    │ • created                │  │ │
│  │  │ • updated    │ • updated                │  │ │
│  │  │ • deleted    │ • deleted                │  │ │
│  │  └──────────────┴──────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────┬───────────────────────────────────┘
                   │
        WebSocket (ws:// or wss://)
                   │
         ┌─────────┴─────────┐
         │                   │
┌────────▼────────┐ ┌───────▼─────────┐
│   Client 1      │ │   Client 2      │
│ (Vue.js App)    │ │ (Vue.js App)    │
│                 │ │                 │
│ Subscribe to:   │ │ Subscribe to:   │
│ • observations  │ │ • observations  │
│ • comments      │ │ • comments      │
└─────────────────┘ └─────────────────┘
```

## Server Configuration

### Setup (backend/src/config/websocket.js)

```javascript
import { WSServerPubSub } from 'wsmini'

const wss = new WSServerPubSub({
  origins: CORS_ORIGIN,           // Allowed origins
  maxNbOfClients: 1000,           // Max concurrent connections
  maxInputSize: 100000,           // Max message size (bytes)
  pingTimeout: 30000,             // Ping timeout (ms)
  logLevel: 'info'                // 'info' or 'warn'
})

// Add channels BEFORE starting
wss.addChannel('observations', {
  usersCanPub: false,             // Only server can publish
  usersCanSub: true               // Clients can subscribe
})

wss.addChannel('comments', {
  usersCanPub: false,
  usersCanSub: true
})

// Start WebSocket server
wss.start({ server })             // Attach to HTTP server
```

### Connection Details

**URLs**:
- **Development**: `ws://localhost:3000`
- **Production**: `wss://phenom-backend.onrender.com`

**Port**: WebSocket uses the **same port** as the HTTP server (3000)

**CORS**: Configured to allow connections from frontend origins

## Channels

### 1. observations Channel

Broadcasts events related to observations.

**Event Types**:
- `observation:created` - New observation posted
- `observation:updated` - Observation modified
- `observation:deleted` - Observation removed

**Message Format**:
```json
{
  "type": "observation:created",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Triangular UFO over Geneva",
    "description": "...",
    "location": {
      "type": "Point",
      "coordinates": [6.1432, 46.2044]
    },
    "userId": "507f1f77bcf86cd799439011",
    "date": "2024-11-15T20:30:00.000Z",
    "type": "RAY",
    "tags": ["night", "triangular"],
    "createdAt": "2024-11-15T21:00:00.000Z",
    "updatedAt": "2024-11-15T21:00:00.000Z"
  },
  "timestamp": "2024-11-15T21:00:00.500Z"
}
```

### 2. comments Channel

Broadcasts events related to comments.

**Event Types**:
- `comment:created` - New comment posted
- `comment:updated` - Comment modified
- `comment:deleted` - Comment removed

**Message Format**:
```json
{
  "type": "comment:created",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "text": "I saw something similar!",
    "observationId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-11-16T08:30:00.000Z",
    "updatedAt": "2024-11-16T08:30:00.000Z"
  },
  "timestamp": "2024-11-16T08:30:00.200Z"
}
```

## Server-Side Publishing

### Helper Functions

```javascript
// Publish to observations channel
publishObservationEvent(type, data)

// Publish to comments channel
publishCommentEvent(type, data)
```

### Usage in Controllers

**Creating an Observation**:
```javascript
// observation.controller.js
export const createObservation = async (req, res, next) => {
  try {
    const observation = await observationService.create(userId, data)
    
    // Publish WebSocket event
    publishObservationEvent('observation:created', observation)
    
    res.status(201).json({ success: true, data: observation })
  } catch (error) {
    next(error)
  }
}
```

**Updating an Observation**:
```javascript
export const updateObservation = async (req, res, next) => {
  try {
    const observation = await observationService.update(id, data)
    
    // Publish WebSocket event
    publishObservationEvent('observation:updated', observation)
    
    res.json({ success: true, data: observation })
  } catch (error) {
    next(error)
  }
}
```

**Deleting an Observation**:
```javascript
export const deleteObservation = async (req, res, next) => {
  try {
    await observationService.delete(id)
    
    // Publish WebSocket event (send ID only)
    publishObservationEvent('observation:deleted', { _id: id })
    
    res.json({ success: true, message: 'Deleted' })
  } catch (error) {
    next(error)
  }
}
```

**Similar for Comments**:
```javascript
publishCommentEvent('comment:created', comment)
publishCommentEvent('comment:updated', comment)
publishCommentEvent('comment:deleted', { _id: commentId })
```

## Client Integration

### Frontend Composable (useWebSocket.js)

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

export const useWebSocket = () => {
  const ws = ref(null)
  const connected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  
  // Detect environment
  const wsUrl = import.meta.env.PROD
    ? 'wss://phenom-backend.onrender.com'
    : 'ws://localhost:3000'
  
  // Connection
  const connect = () => {
    ws.value = new WebSocket(wsUrl)
    
    ws.value.onopen = () => {
      console.log('✅ WebSocket connected')
      connected.value = true
      reconnectAttempts.value = 0
    }
    
    ws.value.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
    }
    
    ws.value.onclose = (event) => {
      console.log('🔌 WebSocket closed', event.code)
      connected.value = false
      
      // Auto-reconnect
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        setTimeout(connect, 3000 * reconnectAttempts.value)
      }
    }
  }
  
  // Subscribe to channel
  const subscribe = (channel, callback) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not ready, waiting...')
      setTimeout(() => subscribe(channel, callback), 1000)
      return
    }
    
    // Send subscription message
    ws.value.send(JSON.stringify({
      action: 'subscribe',
      channel: channel
    }))
    
    // Handle incoming messages
    ws.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        callback(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }
  }
  
  // Unsubscribe from channel
  const unsubscribe = (channel) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({
        action: 'unsubscribe',
        channel: channel
      }))
    }
  }
  
  // Disconnect
  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }
  
  // Auto-connect on mount
  onMounted(() => {
    connect()
  })
  
  // Auto-disconnect on unmount
  onUnmounted(() => {
    disconnect()
  })
  
  return {
    connected,
    subscribe,
    unsubscribe,
    disconnect
  }
}
```

### Usage in Components

**Feed View with Real-time Updates**:
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { useObservations } from '@/composables/useObservations'

const { observations, fetchObservations } = useObservations()
const { subscribe } = useWebSocket()

// Handle WebSocket messages
const handleWebSocketMessage = (message) => {
  console.log('WebSocket message:', message)
  
  switch (message.type) {
    case 'observation:created':
      // Add new observation to the top
      observations.value.unshift(message.data)
      break
      
    case 'observation:updated':
      // Update existing observation
      const index = observations.value.findIndex(
        obs => obs._id === message.data._id
      )
      if (index !== -1) {
        observations.value[index] = message.data
      }
      break
      
    case 'observation:deleted':
      // Remove deleted observation
      observations.value = observations.value.filter(
        obs => obs._id !== message.data._id
      )
      break
  }
}

onMounted(async () => {
  // Initial load
  await fetchObservations()
  
  // Subscribe to real-time updates
  subscribe('observations', handleWebSocketMessage)
})
</script>

<template>
  <div class="observations-feed">
    <div v-for="obs in observations" :key="obs._id">
      <!-- Observation card -->
    </div>
  </div>
</template>
```

**Observation Detail with Real-time Comments**:
```vue
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWebSocket } from '@/composables/useWebSocket'
import { observationService } from '@/services/observationService'

const route = useRoute()
const observation = ref(null)
const comments = ref([])
const { subscribe } = useWebSocket()

// Handle comment events
const handleCommentEvent = (message) => {
  // Only handle comments for this observation
  if (message.data.observationId !== observation.value._id) {
    return
  }
  
  switch (message.type) {
    case 'comment:created':
      comments.value.push(message.data)
      break
      
    case 'comment:updated':
      const index = comments.value.findIndex(c => c._id === message.data._id)
      if (index !== -1) {
        comments.value[index] = message.data
      }
      break
      
    case 'comment:deleted':
      comments.value = comments.value.filter(c => c._id !== message.data._id)
      break
  }
}

onMounted(async () => {
  // Load observation
  const { data } = await observationService.getById(route.params.id)
  observation.value = data
  comments.value = data.comments || []
  
  // Subscribe to comments
  subscribe('comments', handleCommentEvent)
})
</script>
```

## Message Protocol

### Client → Server

**Subscribe to Channel**:
```json
{
  "action": "subscribe",
  "channel": "observations"
}
```

**Unsubscribe from Channel**:
```json
{
  "action": "unsubscribe",
  "channel": "observations"
}
```

### Server → Client

**Standard Message Format**:
```json
{
  "type": "event:action",
  "data": { /* event data */ },
  "timestamp": "2024-11-15T21:00:00.500Z"
}
```

**Connection Acknowledgment**:
WsMini automatically sends connection confirmation.

**Ping/Pong**:
Automatic ping every 30 seconds to keep connection alive.

## Security

### Server-Side Publishing Only

- Clients can **subscribe** to channels
- Clients **cannot publish** events
- Only server publishes (via `wss.pub()`)
- Prevents unauthorized event broadcasting

### CORS Protection

```javascript
origins: process.env.CORS_ORIGIN || '*'
```

**Development**: `*` (allow all)
**Production**: Specific frontend domain(s)

### Message Size Limit

```javascript
maxInputSize: 100000  // 100KB max message size
```

Prevents large message attacks.

### Connection Limits

```javascript
maxNbOfClients: 1000  // Max 1000 concurrent connections
```

## Error Handling

### Client-Side

**Connection Errors**:
```javascript
ws.onerror = (error) => {
  console.error('WebSocket error:', error)
  // Show user notification
  toast.error('Real-time updates unavailable')
}
```

**Close Events**:
```javascript
ws.onclose = (event) => {
  console.log('Connection closed:', event.code, event.reason)
  
  // Reconnect logic
  if (event.code !== 1000) {  // Not normal closure
    setTimeout(reconnect, 3000)
  }
}
```

**Message Parse Errors**:
```javascript
ws.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data)
    handleMessage(message)
  } catch (error) {
    console.error('Failed to parse message:', error)
  }
}
```

### Server-Side

**Publish Errors**:
```javascript
try {
  wss.pub(channel, message)
} catch (error) {
  console.error('Failed to publish event:', error)
  // Event not sent, but operation continues
}
```

## Performance

### Connection Pooling

- Maintains active connections efficiently
- Automatic cleanup of dead connections
- Ping/pong heartbeat every 30s

### Message Batching

For multiple rapid events, consider batching:
```javascript
let eventQueue = []
let timeout = null

const queueEvent = (event) => {
  eventQueue.push(event)
  
  if (!timeout) {
    timeout = setTimeout(() => {
      publishBatch(eventQueue)
      eventQueue = []
      timeout = null
    }, 100)
  }
}
```

### Selective Subscriptions

Clients only subscribe to needed channels:
```javascript
// Only subscribe to observations on feed page
if (route.name === 'feed') {
  subscribe('observations', handler)
}

// Only subscribe to comments on detail page
if (route.name === 'observation-detail') {
  subscribe('comments', handler)
}
```

## Testing

### Manual Testing

**Browser Console**:
```javascript
// Connect
const ws = new WebSocket('ws://localhost:3000')

// Subscribe to observations
ws.onopen = () => {
  ws.send(JSON.stringify({ action: 'subscribe', channel: 'observations' }))
}

// Listen for messages
ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data))
}

// Create an observation via API to trigger event
```

### Automated Testing

```javascript
// websocket.test.js
import WebSocket from 'ws'

describe('WebSocket Server', () => {
  let ws
  
  beforeEach(() => {
    ws = new WebSocket('ws://localhost:3000')
  })
  
  afterEach(() => {
    ws.close()
  })
  
  test('should connect successfully', (done) => {
    ws.on('open', () => {
      expect(ws.readyState).toBe(WebSocket.OPEN)
      done()
    })
  })
  
  test('should receive observation events', (done) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({ action: 'subscribe', channel: 'observations' }))
    })
    
    ws.on('message', (data) => {
      const message = JSON.parse(data)
      expect(message).toHaveProperty('type')
      expect(message).toHaveProperty('data')
      expect(message).toHaveProperty('timestamp')
      done()
    })
  })
})
```

## Troubleshooting

### Connection Fails

**Check**:
1. Backend server is running
2. WebSocket URL is correct
3. CORS is configured
4. Firewall allows WebSocket connections

**Debug**:
```javascript
ws.onerror = (error) => {
  console.error('Connection error:', error)
}
```

### No Messages Received

**Check**:
1. Subscription was sent
2. Events are being triggered on server
3. Message format is correct

**Debug**:
```javascript
// Server-side logging
wss.pub(channel, message)
console.log('Published to', channel, ':', message)

// Client-side logging
ws.onmessage = (event) => {
  console.log('Raw message:', event.data)
}
```

### Connection Drops

**Check**:
1. Network stability
2. Ping timeout settings
3. Server uptime

**Solution**: Implement auto-reconnect with exponential backoff.

## Best Practices

1. **Always clean up connections** - Unsubscribe and close on component unmount
2. **Handle reconnection** - Implement auto-reconnect with backoff
3. **Validate messages** - Check message structure before processing
4. **Filter events** - Only process relevant events (e.g., comments for current observation)
5. **Error handling** - Always catch and log WebSocket errors
6. **Security** - Never trust client messages, validate on server
7. **Performance** - Batch events when possible, avoid unnecessary re-renders

## Related Documentation

- [Backend Architecture](Backend-Architecture) - Server implementation
- [Frontend Architecture](Frontend-Architecture) - Client integration
- [API Reference](API-Reference) - REST API endpoints
- [Development Guide](Development-Guide) - Development setup
