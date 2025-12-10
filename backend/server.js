/**
 * Smart Waste Collection Robot - Backend Server
 * 
 * This server:
 * 1. Connects to MQTT broker to receive sensor data from the robot
 * 2. Uses Socket.io to push real-time updates to the frontend
 * 3. Handles connection status and data transformation
 * 4. Stores sensor data in MySQL database for historical analysis
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
const cors = require('cors');
const { 
  initializeDatabase, 
  saveSensorData, 
  getHistoryData, 
  getStatistics, 
  getLatestData,
  closeDatabase 
} = require('./database');

// ========== CONFIGURATION ==========
const PORT = process.env.PORT || 5000;
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://test.mosquitto.org';
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'robot/waste/sensor';

// ========== EXPRESS & SOCKET.IO SETUP ==========
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// ========== MQTT CLIENT SETUP ==========
const mqttClient = mqtt.connect(MQTT_BROKER, {
  clientId: `waste-monitor-${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  reconnectPeriod: 5000,
});

// ========== STATE TRACKING ==========
let latestSensorData = {
  distance: null,
  capacity: 0,
  status: 'UNKNOWN',
  timestamp: null,
  robotOnline: false
};

let connectedClients = 0;

// ========== MQTT EVENT HANDLERS ==========
mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT Broker:', MQTT_BROKER);
  mqttClient.subscribe(MQTT_TOPIC, (err) => {
    if (!err) {
      console.log('📡 Subscribed to topic:', MQTT_TOPIC);
    } else {
      console.error('❌ Subscription error:', err);
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    // Parse incoming MQTT message
    const data = JSON.parse(message.toString());
    console.log('📥 Received MQTT data:', data);

    // Transform sensor data
    const processedData = processSensorData(data);
    
    // Update latest data
    latestSensorData = processedData;

    // Save to database
    try {
      await saveSensorData(processedData);
      console.log('💾 Data saved to database');
    } catch (dbError) {
      console.error('⚠️ Failed to save to database:', dbError.message);
      // Continue broadcasting even if DB save fails
    }

    // Broadcast to all connected Socket.io clients
    io.emit('sensorData', processedData);
    
  } catch (error) {
    console.error('❌ Error processing MQTT message:', error);
  }
});

mqttClient.on('error', (error) => {
  // Log error but don't crash server
  console.error('⚠️ MQTT Connection Error:', error.code || error.message);
  console.log('💡 Server continues in offline mode - use /api/test/sensor for testing');
});

mqttClient.on('reconnect', () => {
  console.log('🔄 Attempting to reconnect to MQTT Broker...');
});

mqttClient.on('offline', () => {
  console.log('📴 MQTT Client is offline');
});

mqttClient.on('close', () => {
  console.log('🔌 MQTT Connection closed');
});

// ========== DATA PROCESSING LOGIC ==========
/**
 * Converts ultrasonic sensor distance to waste capacity
 * @param {Object} data - Raw sensor data from robot
 * @returns {Object} - Processed data with capacity percentage
 */
function processSensorData(data) {
  // Extract distance (in cm)
  const distance = data.distance || data.value || 0;
  
  // Configuration: Bin depth
  // Adjust these values based on your physical bin dimensions
  const BIN_DEPTH = 30; // cm - empty bin depth
  const FULL_THRESHOLD = 5; // cm - distance when bin is full
  
  // Calculate capacity percentage
  // When sensor reads FULL_THRESHOLD or less = 100% full
  // When sensor reads BIN_DEPTH or more = 0% full
  let capacity = 0;
  if (distance <= FULL_THRESHOLD) {
    capacity = 100;
  } else if (distance >= BIN_DEPTH) {
    capacity = 0;
  } else {
    capacity = Math.round(((BIN_DEPTH - distance) / (BIN_DEPTH - FULL_THRESHOLD)) * 100);
  }

  // Determine status
  let status = 'AVAILABLE';
  if (capacity >= 100) {
    status = 'FULL';
  } else if (capacity >= 80) {
    status = 'NEARLY_FULL';
  } else if (capacity >= 50) {
    status = 'HALF_FULL';
  }

  return {
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal
    capacity: Math.max(0, Math.min(100, capacity)), // Clamp between 0-100
    status,
    timestamp: new Date().toISOString(),
    robotOnline: true
  };
}

// ========== SOCKET.IO EVENT HANDLERS ==========
io.on('connection', async (socket) => {
  connectedClients++;
  console.log(`🔌 Client connected (Total: ${connectedClients})`);

  // Send latest data from DATABASE immediately upon connection
  try {
    const latestFromDB = await getLatestData();
    if (latestFromDB) {
      // Convert database format to frontend format
      const dataToSend = {
        distance: latestFromDB.distance,
        capacity: latestFromDB.capacity,
        status: latestFromDB.status,
        timestamp: latestFromDB.created_at,
        robotOnline: latestFromDB.robot_online
      };
      socket.emit('sensorData', dataToSend);
      console.log('📤 Sent latest data from DB to new client');
    } else {
      // Fallback to memory if DB is empty
      if (latestSensorData.timestamp) {
        socket.emit('sensorData', latestSensorData);
      }
    }
  } catch (error) {
    console.error('⚠️ Error fetching latest from DB:', error.message);
    // Fallback to memory
    if (latestSensorData.timestamp) {
      socket.emit('sensorData', latestSensorData);
    }
  }

  // Send initial connection status
  socket.emit('connectionStatus', {
    mqttConnected: mqttClient.connected,
    topic: MQTT_TOPIC
  });

  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`🔌 Client disconnected (Total: ${connectedClients})`);
  });

  // Allow clients to request latest data from DATABASE
  socket.on('requestData', async () => {
    try {
      const latestFromDB = await getLatestData();
      if (latestFromDB) {
        const dataToSend = {
          distance: latestFromDB.distance,
          capacity: latestFromDB.capacity,
          status: latestFromDB.status,
          timestamp: latestFromDB.created_at,
          robotOnline: latestFromDB.robot_online
        };
        socket.emit('sensorData', dataToSend);
        console.log('📤 Sent latest data from DB on request');
      } else if (latestSensorData.timestamp) {
        socket.emit('sensorData', latestSensorData);
      }
    } catch (error) {
      console.error('⚠️ Error on requestData:', error.message);
      if (latestSensorData.timestamp) {
        socket.emit('sensorData', latestSensorData);
      }
    }
  });
});

// ========== REST API ENDPOINTS ==========
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Waste Collection Robot - Monitoring Server',
    status: 'online',
    mqtt: {
      connected: mqttClient.connected,
      broker: MQTT_BROKER,
      topic: MQTT_TOPIC
    },
    clients: connectedClients
  });
});

app.get('/api/status', async (req, res) => {
  try {
    // Get latest data from database for consistency
    const latestFromDB = await getLatestData();
    const dataToReturn = latestFromDB ? {
      distance: latestFromDB.distance,
      capacity: latestFromDB.capacity,
      status: latestFromDB.status,
      timestamp: latestFromDB.created_at,
      robotOnline: latestFromDB.robot_online
    } : latestSensorData;

    res.json({
      latestData: dataToReturn,
      mqtt: {
        connected: mqttClient.connected,
        broker: MQTT_BROKER
      },
      connectedClients,
      dataSource: latestFromDB ? 'database' : 'memory'
    });
  } catch (error) {
    console.error('⚠️ Error in /api/status:', error.message);
    // Fallback to memory
    res.json({
      latestData: latestSensorData,
      mqtt: {
        connected: mqttClient.connected,
        broker: MQTT_BROKER
      },
      connectedClients,
      dataSource: 'memory (fallback)'
    });
  }
});

// Endpoint to test/simulate sensor data (for development)
app.post('/api/test/sensor', async (req, res) => {
  const { distance } = req.body;
  
  if (distance === undefined) {
    return res.status(400).json({ error: 'Distance is required' });
  }

  const testData = processSensorData({ distance });
  latestSensorData = testData;
  
  // Save test data to database
  try {
    await saveSensorData(testData);
  } catch (dbError) {
    console.error('⚠️ Failed to save test data to database:', dbError.message);
  }
  
  io.emit('sensorData', testData);

  res.json({
    message: 'Test data sent',
    data: testData
  });
});

// ========== HISTORY API ENDPOINTS ==========
// Get history data with filters and pagination
app.get('/api/history', async (req, res) => {
  try {
    const {
      status,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const result = await getHistoryData({
      status,
      startDate,
      endDate,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history data',
      message: error.message
    });
  }
});

// Get statistics
app.get('/api/history/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await getStatistics({ startDate, endDate });

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// Get latest data from database
app.get('/api/history/latest', async (req, res) => {
  try {
    const latest = await getLatestData();

    res.json({
      success: true,
      data: latest
    });
  } catch (error) {
    console.error('❌ Error fetching latest data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest data',
      message: error.message
    });
  }
});

// ========== SERVER STARTUP ==========
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Load latest data from database on startup
    try {
      const latestFromDB = await getLatestData();
      if (latestFromDB) {
        latestSensorData = {
          distance: latestFromDB.distance,
          capacity: latestFromDB.capacity,
          status: latestFromDB.status,
          timestamp: latestFromDB.created_at,
          robotOnline: latestFromDB.robot_online
        };
        console.log('📊 Loaded latest sensor data from database');
        console.log(`   → Status: ${latestFromDB.status}, Capacity: ${latestFromDB.capacity}%`);
      }
    } catch (error) {
      console.log('ℹ️ No previous data in database (fresh start)');
    }
    
    // Start HTTP server
    server.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log('║  🤖 Smart Waste Robot Monitoring Server       ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 MQTT Broker: ${MQTT_BROKER}`);
      console.log(`📻 Listening on topic: ${MQTT_TOPIC}`);
      console.log(`\n💡 API Endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/`);
      console.log(`   - GET  http://localhost:${PORT}/api/status`);
      console.log(`   - POST http://localhost:${PORT}/api/test/sensor`);
      console.log(`   - GET  http://localhost:${PORT}/api/history`);
      console.log(`   - GET  http://localhost:${PORT}/api/history/stats`);
      console.log(`   - GET  http://localhost:${PORT}/api/history/latest`);
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  mqttClient.end();
  await closeDatabase();
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
