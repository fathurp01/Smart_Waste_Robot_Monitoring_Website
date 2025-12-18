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
  getDailyVolumeData,
  closeDatabase 
} = require('./database');

const PORT = process.env.PORT || 5000;
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://10.78.229.157';
const MQTT_TOPIC_REALTIME = 'robot/waste/sensor/realtime';
const MQTT_TOPIC_DB = 'robot/waste/sensor/db';

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
  credentials: true
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

const mqttClient = mqtt.connect(MQTT_BROKER, {
  clientId: `waste-monitor-${Math.random().toString(16).slice(2, 10)}`,
  clean: true,
  reconnectPeriod: 5000,
});

let latestSensorData = {
  distance: null,
  capacity: 0,
  status: 'UNKNOWN',
  timestamp: null,
  robotOnline: false
};

let connectedClients = 0;

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT Broker:', MQTT_BROKER);
  mqttClient.subscribe([MQTT_TOPIC_REALTIME, MQTT_TOPIC_DB], (err) => {
    if (!err) {
      console.log('📡 Subscribed to topics:', MQTT_TOPIC_REALTIME, MQTT_TOPIC_DB);
    } else {
      console.error('❌ Subscription error:', err);
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📥 Received from ${topic}:`, data);

    const processedData = processSensorData(data);
    
    if (topic === MQTT_TOPIC_REALTIME) {
      latestSensorData = processedData;
      io.emit('sensorData', processedData);
      console.log('📤 Realtime data broadcasted to clients');
    } 
    else if (topic === MQTT_TOPIC_DB) {
      try {
        await saveSensorData(processedData);
        console.log('💾 Data saved to database');
      } catch (dbError) {
        console.error('⚠️ Failed to save to database:', dbError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error processing MQTT message:', error);
  }
});

mqttClient.on('error', (error) => {
  console.error('⚠️ MQTT Connection Error:', error.code || error.message);
  console.log('💡 Server continues in offline mode');
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

function processSensorData(data) {
  const distance = data.distance || data.value || 0;
  
  const BIN_DEPTH = 24;
  const FULL_THRESHOLD = 14
  
  let capacity = 0;
  if (distance <= FULL_THRESHOLD && distance >= 40) {
    capacity = 100;
  } else if (distance >= BIN_DEPTH && distance <= 40) {
    capacity = 0;
  } else {
    capacity = Math.round(((BIN_DEPTH - distance) / (BIN_DEPTH - FULL_THRESHOLD)) * 100);
  }

  let status = 'AVAILABLE';
  if (capacity >= 100) {
    status = 'FULL';
  } else if (capacity >= 80) {
    status = 'NEARLY_FULL';
  } else if (capacity >= 50) {
    status = 'HALF_FULL';
  }

  return {
    distance: Math.round(distance * 10) / 10,
    capacity: Math.max(0, Math.min(100, capacity)),
    status,
    timestamp: new Date().toISOString(),
    robotOnline: true
  };
}

io.on('connection', async (socket) => {
  connectedClients++;
  console.log(`🔌 Client connected (Total: ${connectedClients})`);

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
      console.log('📤 Sent latest data from DB to new client');
    } else {
      if (latestSensorData.timestamp) {
        socket.emit('sensorData', latestSensorData);
      }
    }
  } catch (error) {
    console.error('⚠️ Error fetching latest from DB:', error.message);
    if (latestSensorData.timestamp) {
      socket.emit('sensorData', latestSensorData);
    }
  }

  socket.emit('connectionStatus', {
    mqttConnected: mqttClient.connected,
    topicRealtime: MQTT_TOPIC_REALTIME,
    topicDb: MQTT_TOPIC_DB
  });

  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`🔌 Client disconnected (Total: ${connectedClients})`);
  });

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

app.get('/', (req, res) => {
  res.json({
    message: 'Smart Waste Collection Robot - Monitoring Server',
    status: 'online',
    mqtt: {
      connected: mqttClient.connected,
      broker: MQTT_BROKER,
      topicRealtime: MQTT_TOPIC_REALTIME,
      topicDb: MQTT_TOPIC_DB
    },
    clients: connectedClients
  });
});

app.get('/api/status', async (req, res) => {
  try {
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

app.post('/api/test/sensor', async (req, res) => {
  const { distance } = req.body;
  
  if (distance === undefined) {
    return res.status(400).json({ error: 'Distance is required' });
  }

  const testData = processSensorData({ distance });
  latestSensorData = testData;
  
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

app.get('/api/history/daily', async (req, res) => {
  try {
    const { startDate, endDate, days = 7 } = req.query;
    
    const dailyData = await getDailyVolumeData({
      startDate,
      endDate,
      days: parseInt(days)
    });

    res.json({
      success: true,
      data: dailyData
    });
  } catch (error) {
    console.error('❌ Error fetching daily data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily data',
      message: error.message
    });
  }
});

async function startServer() {
  try {
    await initializeDatabase();
    
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
    
    server.listen(PORT, () => {
      console.log('\n╔════════════════════════════════════════════════╗');
      console.log('║  🤖 Smart Waste Robot Monitoring Server       ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 MQTT Broker: ${MQTT_BROKER}`);
      console.log(`📻 Realtime topic: ${MQTT_TOPIC_REALTIME}`);
      console.log(`💾 Database topic: ${MQTT_TOPIC_DB}`);
      console.log(`\n💡 API Endpoints:`);
      console.log(`   - GET  http://localhost:${PORT}/`);
      console.log(`   - GET  http://localhost:${PORT}/api/status`);
      console.log(`   - POST http://localhost:${PORT}/api/test/sensor`);
      console.log(`   - GET  http://localhost:${PORT}/api/history`);
      console.log(`   - GET  http://localhost:${PORT}/api/history/stats`);
      console.log(`   - GET  http://localhost:${PORT}/api/history/latest`);
      console.log(`   - GET  http://localhost:${PORT}/api/history/daily`);
      console.log('\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  
  mqttClient.end();
  await closeDatabase();
  
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});