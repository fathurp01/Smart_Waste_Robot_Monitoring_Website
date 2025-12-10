# 🤖 Smart Waste Collection Robot - Website Monitoring System

<div align="center">

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🌱  SMART WASTE COLLECTION ROBOT  🤖                       ║
║         Real-Time Monitoring Dashboard                         ║
║                                                                ║
║   Built with React • Express • MySQL • MQTT • Socket.io        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-ISC-blue)
![Status](https://img.shields.io/badge/status-production%20ready-success)
![React](https://img.shields.io/badge/React-19-61dafb)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339933)

**A modern, real-time web monitoring system for smart waste management with MySQL database**

[🚀 Quick Start](#-quick-start) • [🎨 Features](#-features) • [📖 Installation](#-installation) • [🐛 Troubleshooting](#-troubleshooting)

</div>

---

## 📋 Table of Contents
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
## 🚀 Quick Start

```bash
# 1. Clone repository
git clone <your-repo-url>
cd Website_Robot_Sampah_IoT

# 2. Install MySQL & create database (see Prerequisites)

# 3. Setup backend
cd backend
npm install
# Edit .env file with your MySQL credentials

# 4. Setup frontend
cd ../frontend
npm install

# 5. Start backend (Terminal 1)
cd backend
## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) + **Express.js** v5.2 - Server framework
- **MySQL2** v3.15 - Database with connection pooling
- **MQTT.js** v5.14 - MQTT protocol client
- **Socket.io** v4.8 - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### Frontend
- **React** v19.2 - Latest React with improved performance
- **React Router DOM** v7.10 - Client-side routing
- **Vite** v7.2 - Lightning-fast build tool
- **Tailwind CSS** v4.1 - Utility-first styling
- **Framer Motion** v12.23 - Smooth animations
- **Socket.io Client** v4.8 - WebSocket client
- **Lucide React** - Beautiful icon library

### Database
- **MySQL** v8.0+ - Relational database for sensor data storage
- Auto-created schema with indexes for optimal performanceiful, intuitive waste capacity visualization with circular gauge
- 📜 **History Page** - View complete sensor data history with filtering and statistics
- 🎯 **Smart Capacity Calculation** - Converts ultrasonic distance to percentage (0-100%)
- 🚨 **Alert System** - Visual notifications when bin is full or nearly full
- 🔌 **Connection Watchdog** - Automatically detects robot offline status (10s timeout)
- 📈 **Statistics Dashboard** - Total records, status breakdown, latest update info

### History Page Features
- 🔍 **Advanced Filters** - Filter by status (FULL priority), date range, search
- 📊 **Statistics Cards** - View total records and status distribution
- 📑 **Pagination** - Browse through records efficiently (10 items per page)
- 📥 **CSV Export** - Export filtered data to CSV file
- 📅 **Date Range Picker** - Select specific date ranges for analysis
- 🔄 **Auto Refresh** - Data updates automatically every 30 seconds

### UI/UX Highlights
- 🌱 **Eco-friendly Theme** - Green color palette symbolizing sustainability
- 🎨 **Modern Design** - Clean, premium Apple-like aesthetic
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile
- ✨ **Smooth Animations** - Framer Motion for delightful interactions
- ⚡ **Real-time Updates** - Instant data refresh without page reload
- 🎭 **Status Indicators** - Clear visual feedback for all states
- 🔀 **React Router** - Seamless navigation between Dashboard and History pages
- 🎭 **Status Indicators** - Clear visual feedback for connection states

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **MQTT.js** - MQTT protocol client
- **Socket.io** - Real-time bidirectional communication
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

### Frontend
- **React 19** - UI framework
## 📁 Project Structure

```
Website_Robot_Sampah_IoT/
├── backend/
│   ├── server.js              # Main Express + MQTT + Socket.io server
│   ├── database.js            # MySQL connection & query functions
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Main dashboard with circular gauge
│   │   │   └── History.jsx          # History page with filters & export
│   │   ├── App.jsx                  # Root component with routing & Socket.io
│   │   ├── App.css                  # Custom animations
│   │   ├── index.css                # Global styles + Tailwind v4
│   │   └── main.jsx                 # Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js           # Tailwind v4 with eco theme
│   ├── vite.config.js
│   ├── .env                         # Frontend environment
│   └── .gitignore
│
├── .gitignore                       # Root gitignore
└── README.md                        # This file
## 📦 Prerequisites

### Required Software
1. **Node.js** >= 18.x ([Download](https://nodejs.org/))
   ```bash
   node --version  # Check installed version
   ```

2. **MySQL** >= 8.0 ([Download](https://dev.mysql.com/downloads/installer/))
   - During installation, remember your root password
   - Default port: 3306

3. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

4. **MQTT Broker** (Optional - default: `test.mosquitto.org`)
   - For local testing, install [Mosquitto](https://mosquitto.org/download/)

### MySQL Setup

#### Windows
```bash
# Install MySQL from https://dev.mysql.com/downloads/installer/
# During installation:
# - Choose "Developer Default"
# - Set root password (remember this!)
# - Port: 3306 (default)

# Verify installation
mysql --version

# Login to MySQL
mysql -u root -p
# Enter your password

# Create database (optional - auto-created by app)
CREATE DATABASE smart_waste_robot;
## ⚙️ Configuration

### Backend Configuration (`backend/.env`)
```env
# Server Port
PORT=3001

# MySQL Database
DB_HOST=localhost          # Database host
DB_USER=root              # MySQL username
DB_PASSWORD=              # Your MySQL password
DB_NAME=smart_waste_robot # Database name (auto-created)
DB_PORT=3306              # MySQL port

# MQTT Broker
MQTT_BROKER=mqtt://test.mosquitto.org  # Public broker or your own
MQTT_TOPIC=robot/waste/sensor          # Topic to subscribe
```

### Frontend Configuration (`frontend/.env`)
```env
## 🎮 Usage

### Development Mode

**Terminal 1 - Start Backend**
```bash
cd backend
npm start
# Server runs on http://localhost:3001
# ✅ MySQL Connected
# ✅ MQTT Connected (or offline mode)
# ✅ Socket.io ready
```

**Terminal 2 - Start Frontend**
```bash
cd frontend
npm run dev
# Vite dev server: http://localhost:5173
# Opens automatically in browser
```

### Access the Application
- **Dashboard**: http://localhost:5173/ or http://localhost:5173/dashboard
- **History Page**: http://localhost:5173/history
- **Backend API**: http://localhost:3001/api/status

### Production Mode

**Build Frontend**
```bash
cd frontend
npm run build
# Static files generated in dist/
```
## 📡 API Documentation

### REST Endpoints

#### GET `/`
Server status and information
```json
{
  "message": "Smart Waste Collection Robot - Monitoring Server",
  "status": "online",
  "database": { "connected": true },
  "mqtt": {
    "connected": true,
    "broker": "mqtt://test.mosquitto.org"
  },
  "clients": 2
}
```

#### GET `/api/status`
Current system status and latest sensor data from database
```json
{
  "latestData": {
    "id": 42,
    "distance": 15.3,
    "capacity": 58,
    "status": "HALF_FULL",
    "timestamp": "2025-12-10T12:34:56.789Z",
    "robotOnline": true
  },
  "mqtt": { "connected": true },
  "database": { "connected": true },
  "connectedClients": 2
}
```

#### GET `/api/history`
Retrieve sensor data history with filters
```bash
GET /api/history?status=FULL&startDate=2025-12-01&endDate=2025-12-10&page=1&limit=10
```

**Query Parameters:**
- `status` - Filter by status (EMPTY, LOW, HALF_FULL, NEARLY_FULL, FULL)
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": 42,
      "distance": 4.5,
      "capacity": 96,
      "status": "FULL",
      "timestamp": "2025-12-10T12:34:56.000Z"
    }
  ],
  "pagination": {
    "page": 1,
## 🧪 Testing

### 1. Test Database Connection
```bash
# Check if MySQL is running
mysql -u root -p
SHOW DATABASES;
USE smart_waste_robot;
SHOW TABLES;
SELECT * FROM sensor_data LIMIT 10;
EXIT;
```

### 2. Test with API Endpoint
```bash
# Full bin (100% - distance 3cm)
curl -X POST http://localhost:3001/api/test/sensor \
  -H "Content-Type: application/json" \
  -d '{"distance": 3}'

# Nearly full (80% - distance 10cm)
curl -X POST http://localhost:3001/api/test/sensor \
  -H "Content-Type: application/json" \
  -d '{"distance": 10}'

# Half full (50% - distance 17cm)
curl -X POST http://localhost:3001/api/test/sensor \
  -H "Content-Type: application/json" \
  -d '{"distance": 17}'

# Low (25% - distance 24cm)
curl -X POST http://localhost:3001/api/test/sensor \
  -H "Content-Type: application/json" \
  -d '{"distance": 24}'

# Empty (0% - distance 30cm)
curl -X POST http://localhost:3001/api/test/sensor \
  -H "Content-Type: application/json" \
  -d '{"distance": 30}'
```

### 3. Test with MQTT (if broker available)
```bash
# Install MQTT.js globally
npm install -g mqtt

# Publish test data
mqtt pub -h test.mosquitto.org -t robot/waste/sensor -m '{"distance": 8}'
mqtt pub -h test.mosquitto.org -t robot/waste/sensor -m '{"distance": 25}'
```

### 4. Verify Data Flow
1. Send test data via API or MQTT
2. Check backend console - should show "Data saved to database"
3. Check frontend Dashboard - should update in real-time
4. Go to History page - should show new record
5. Check MySQL:
   ```sql
   SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 5;
   ```

### 5. Test History Features
- Filter by status (FULL, NEARLY_FULL, etc.)
- Select date range
- Test pagination
- Export to CSV
- Verify statistics cards updateET `/api/history/latest`
Get latest sensor record
```json
{
  "id": 150,
  "distance": 15.3,
  "capacity": 58,
  "status": "HALF_FULL",
  "timestamp": "2025-12-10T14:20:30.000Z"
}
```

#### POST `/api/test/sensor`
Test endpoint - simulate sensor data (development only)
```bash
curl -X POST http://localhost:3001/api/test/sensor \
  -H "Content-Type: application/json" \
  -d '{"distance": 12}'
```

### Socket.io Events

#### Client → Server
- `requestData` - Request latest sensor data from database

#### Server → Client
- `sensorData` - Broadcast sensor updates (after saving to DB)
  ```json
  {
    "id": 151,
    "distance": 15.3,
    "capacity": 58,
    "status": "HALF_FULL",
    "timestamp": "2025-12-10T14:25:00.000Z",
    "robotOnline": true
  }
  ```
- `connectionStatus` - MQTT connection state
- `historyUpdate` - New data available for history page
# Create .env file
cp .env.example .env
# Ensure VITE_SOCKET_URL points to your backend
\`\`\`
## 🐛 Troubleshooting

### Database Issues

**Problem:** Cannot connect to MySQL / ECONNREFUSED
```
Solution:
1. Check if MySQL is running:
   - Windows: Services → MySQL → Start
   - Linux: sudo systemctl status mysql
   - Mac: brew services list

2. Verify credentials in backend/.env:
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306

3. Test MySQL connection:
   mysql -u root -p
```

**Problem:** Access denied for user 'root'@'localhost'
```
Solution:
1. Reset MySQL root password
2. Update DB_PASSWORD in backend/.env
3. Restart backend server
```

**Problem:** Database 'smart_waste_robot' doesn't exist
```
Solution: The database is auto-created on first run
If it fails, create manually:
mysql -u root -p
CREATE DATABASE smart_waste_robot;
EXIT;
```

### Backend Issues

**Problem:** Port 3001 already in use
```
Solution: 
## 🎨 Customization

### Change Color Theme
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    50: '#f0fdf4',
    500: '#22c55e',  // Main green color
    600: '#16a34a',
  }
}
```

### Adjust Bin Dimensions
Edit `backend/server.js`:
```javascript
const BIN_DEPTH = 30;         // cm - distance when empty
const FULL_THRESHOLD = 5;     // cm - distance when full
```

### Change Connection Timeout
Edit `frontend/src/App.jsx`:
```javascript
const CONNECTION_TIMEOUT = 10000; // milliseconds (10 seconds)
```

### Modify Database Schema
Edit `backend/database.js` function `initializeDatabase()`:
```javascript
// Add custom columns or indexes
CREATE TABLE IF NOT EXISTS sensor_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  distance FLOAT NOT NULL,
  capacity INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  your_custom_field VARCHAR(255)  -- Add here
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Change History Page Items Per Page
Edit `frontend/src/components/History.jsx`:
```javascript
const [pagination, setPagination] = useState({
  page: 1,
  limit: 10,  // Change this number
  total: 0
});
```

## 📊 Data Flow Architecture

```
MQTT Broker (Robot)
      ↓
Backend MQTT Client
      ↓
MySQL Database (sensor_data table)
      ↓
Socket.io Server
      ↓
Frontend (Dashboard & History)
```

**Key Points:**
- All data **must** go through database first
- Frontend always reads from database (via API or Socket.io)
- Real-time updates via Socket.io after DB save
- History page queries database directly via REST API

## 📝 License

ISC License - Free for educational and commercial use.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🐞 Report Issues

Found a bug? Please open an issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- System info (OS, Node version, MySQL version)

## 👨‍💻 Author

Built with 💚 for a cleaner, smarter environment 🌱

---

**⭐ Star this repo if you find it helpful!**
2. Check browser console for errors
3. Verify backend shows "Data saved to database"
4. Check database: SELECT * FROM sensor_data;
```

**Problem:** History page is empty
```
Solution:
1. Insert test data via /api/test/sensor
2. Check database has records: SELECT COUNT(*) FROM sensor_data;
3. Check browser console for API errors
4. Verify backend is running on correct port
```

**Problem:** Tailwind CSS not working
```
Solution:
1. Check index.css has correct imports:
   @import "tailwindcss/preflight";
   @import "tailwindcss/utilities";

2. Restart Vite dev server:
   cd frontend
   npm run dev
```

**Problem:** Routing not working / 404 errors
```
Solution:
1. Access http://localhost:5173/ (auto-redirects to /dashboard)
2. Or directly: http://localhost:5173/dashboard
3. Check React Router is installed: npm list react-router-dom
```

### Robot Integration

**Problem:** Robot not publishing data
```
Solution:
1. Ensure robot publishes to correct MQTT topic (robot/waste/sensor)
2. Data format must be: {"distance": <number>}
3. Check robot's WiFi connection
4. Verify MQTT broker URL matches
5. Test manually: mqtt pub -h test.mosquitto.org -t robot/waste/sensor -m '{"distance": 15}'
```

### Common Error Messages

**"ECONNREFUSED 127.0.0.1:3306"**
→ MySQL is not running. Start MySQL service.

**"Access denied for user 'root'"**
→ Wrong MySQL password in .env file.

**"Cannot GET /api/history"**
→ Backend server not running or wrong port.

**"Socket.io connection error"**
→ Backend not running or VITE_SOCKET_URL incorrect.

**"Module not found: mqtt"**
→ Run `npm install` in backend folder.uild Frontend
\`\`\`bash
cd frontend
npm run build
# Static files generated in dist/
\`\`\`

#### Serve Backend
\`\`\`bash
cd backend
npm start
\`\`\`

## 📡 API Documentation

### REST Endpoints

#### GET `/`
Returns server status
\`\`\`json
{
  "message": "Smart Waste Collection Robot - Monitoring Server",
  "status": "online",
  "mqtt": {
    "connected": true,
    "broker": "mqtt://test.mosquitto.org",
    "topic": "robot/waste/sensor"
  },
  "clients": 2
}
\`\`\`

#### GET `/api/status`
Returns current system status and latest sensor data
\`\`\`json
{
  "latestData": {
    "distance": 15.3,
    "capacity": 58,
    "status": "HALF_FULL",
    "timestamp": "2025-12-10T12:34:56.789Z",
    "robotOnline": true
  },
  "mqtt": {
    "connected": true,
    "broker": "mqtt://test.mosquitto.org"
  },
  "connectedClients": 2
}
\`\`\`

#### POST `/api/test/sensor`
Test endpoint to simulate sensor data (development only)
\`\`\`bash
curl -X POST http://localhost:5000/api/test/sensor \
  -H "Content-Type: application/json" \
  -d '{"distance": 12}'
\`\`\`

### Socket.io Events

#### Client → Server
- \`requestData\` - Request latest sensor data

#### Server → Client
- \`sensorData\` - Broadcast sensor updates
  \`\`\`json
  {
    "distance": 15.3,
    "capacity": 58,
    "status": "HALF_FULL",
    "timestamp": "2025-12-10T12:34:56.789Z",
    "robotOnline": true
  }
  \`\`\`
- \`connectionStatus\` - MQTT connection state

## 🧪 Testing

### Test with MQTT Simulator
\`\`\`bash
# Install MQTT.js globally
npm install -g mqtt

# Publish test data
mqtt pub -h test.mosquitto.org -t robot/waste/sensor -m '{"distance": 8}'
mqtt pub -h test.mosquitto.org -t robot/waste/sensor -m '{"distance": 25}'
\`\`\`

### Test with API
\`\`\`bash
# Full bin (100%)
curl -X POST http://localhost:5000/api/test/sensor -H "Content-Type: application/json" -d '{"distance": 3}'

# Half full (50%)
curl -X POST http://localhost:5000/api/test/sensor -H "Content-Type: application/json" -d '{"distance": 17}'

# Empty (0%)
curl -X POST http://localhost:5000/api/test/sensor -H "Content-Type: application/json" -d '{"distance": 30}'
\`\`\`

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Cannot connect to MQTT broker
\`\`\`
Solution: Check your internet connection and MQTT_BROKER URL in .env
Try using a different public broker: mqtt://broker.hivemq.com
\`\`\`

**Problem:** Port 5000 already in use
\`\`\`
Solution: Change PORT in backend/.env to another port (e.g., 5001)
Update VITE_SOCKET_URL in frontend/.env accordingly
\`\`\`

### Frontend Issues

**Problem:** Connection refused / Cannot connect to backend
\`\`\`
Solution: Ensure backend is running first
Check VITE_SOCKET_URL in frontend/.env matches backend PORT
\`\`\`

**Problem:** No data showing on dashboard
\`\`\`
Solution: 
1. Check browser console for Socket.io errors
2. Verify MQTT broker is receiving data
3. Use /api/test/sensor endpoint to inject test data
4. Check backend console for MQTT connection status
\`\`\`

### Robot Integration

**Problem:** Robot not publishing data
\`\`\`
Solution:
1. Ensure robot code publishes to correct MQTT topic
2. Topic must match MQTT_TOPIC in backend/.env
3. Data format should be: {"distance": <number>}
4. Check robot's WiFi connection
\`\`\`

## 🎨 Customization

### Change Color Theme
Edit \`frontend/tailwind.config.js\`:
\`\`\`javascript
colors: {
  primary: {
    500: '#your-color',  // Change main green color
  }
}
\`\`\`

### Adjust Capacity Calculation
Edit \`backend/server.js\`:
\`\`\`javascript
const BIN_DEPTH = 30;         // Your bin depth in cm
const FULL_THRESHOLD = 5;     // When to consider "full"
\`\`\`

### Change Connection Timeout
Edit \`frontend/src/App.jsx\`:
\`\`\`javascript
const CONNECTION_TIMEOUT = 10000; // milliseconds
\`\`\`

## 📝 License

ISC License - Feel free to use this project for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with 💚 for a cleaner environment** 🌱
