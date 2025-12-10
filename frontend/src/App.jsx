import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Recycle, Activity, History as HistoryIcon, LayoutDashboard } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StatusCard, { AlertBanner } from './components/StatusCard';
import History from './components/History';
import './App.css';

// ========== CONFIGURATION ==========
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const CONNECTION_TIMEOUT = 10000; // 10 seconds

function App() {
  // ========== STATE MANAGEMENT ==========
  const [sensorData, setSensorData] = useState({
    distance: 0,
    capacity: 0,
    status: 'UNKNOWN',
    timestamp: null,
    robotOnline: false
  });

  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('warning');

  // Refs for Socket.io and timeout tracking
  const socketRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastDataTimeRef = useRef(Date.now());

  // ========== SOCKET.IO CONNECTION ==========
  useEffect(() => {
    console.log('🔌 Connecting to Socket.io server:', SOCKET_URL);
    
    // Initialize Socket.io connection
    socketRef.current = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    // Connection established
    socketRef.current.on('connect', () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
      lastDataTimeRef.current = Date.now();
      
      // Request latest data
      socketRef.current.emit('requestData');
    });

    // Connection lost
    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setIsConnected(false);
    });

    // Receive sensor data
    socketRef.current.on('sensorData', (data) => {
      console.log('📥 Received sensor data:', data);
      
      lastDataTimeRef.current = Date.now();
      setSensorData(data);
      setIsConnected(true);

      // Add to history (limit to 50 entries)
      setHistory(prev => {
        const newHistory = [...prev, data];
        return newHistory.slice(-50);
      });

      // Trigger alerts based on capacity
      if (data.capacity >= 100) {
        triggerAlert('🚨 Waste Bin is FULL! Please empty immediately.', 'danger');
      } else if (data.capacity >= 80) {
        triggerAlert('⚠️ Waste Bin is nearly full (80%+)', 'warning');
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ========== CONNECTION WATCHDOG ==========
  // Monitor for data inactivity (10 seconds without data = offline)
  useEffect(() => {
    const checkConnection = setInterval(() => {
      const timeSinceLastData = Date.now() - lastDataTimeRef.current;
      
      if (timeSinceLastData > CONNECTION_TIMEOUT) {
        console.warn('⚠️ No data received for 10 seconds - marking as offline');
        setIsConnected(false);
        setSensorData(prev => ({
          ...prev,
          robotOnline: false
        }));
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkConnection);
  }, []);

  // ========== ALERT SYSTEM ==========
  const triggerAlert = (message, type = 'warning') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  // ========== RENDER ==========
  return (
    <Router>
      <AppContent
        sensorData={sensorData}
        isConnected={isConnected}
        history={history}
        showAlert={showAlert}
        alertMessage={alertMessage}
        alertType={alertType}
      />
    </Router>
  );
}

// ========== APP CONTENT COMPONENT ==========
function AppContent({ sensorData, isConnected, history, showAlert, alertMessage, alertType }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-primary-50/30 to-emerald-50/30">
      {/* Header with Navigation */}
      <Header isConnected={isConnected} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Routes */}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <>
              {/* Alert Banner */}
              <AnimatePresence>
                {showAlert && (
                  <div className="mb-6">
                    <AlertBanner 
                      show={showAlert} 
                      message={alertMessage} 
                      type={alertType} 
                    />
                  </div>
                )}
              </AnimatePresence>

              {/* Status Card */}
              <div className="mb-6">
                <StatusCard 
                  isConnected={isConnected} 
                  lastUpdate={sensorData.timestamp} 
                />
              </div>

              {/* Main Dashboard */}
              <Dashboard 
                sensorData={sensorData} 
                isConnected={isConnected}
                history={history}
              />
            </>
          } />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

// ========== HEADER COMPONENT ==========
function Header({ isConnected }) {
  const location = useLocation();
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm"
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-primary-100 rounded-xl"
              >
                <Recycle className="w-8 h-8 text-primary-600" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Smart Waste Robot
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time Monitoring System
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-6">
              <nav className="flex items-center gap-2">
                <Link 
                  to="/dashboard" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'bg-primary-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <Link 
                  to="/history" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    location.pathname === '/history' 
                      ? 'bg-primary-500 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <HistoryIcon size={18} />
                  Riwayat
                </Link>
              </nav>

              <div className="flex items-center gap-2 pl-6 border-l border-gray-200">
                <Activity className={`w-5 h-5 ${isConnected ? 'text-primary-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${isConnected ? 'text-primary-600' : 'text-red-600'}`}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>
    );
}

// ========== FOOTER COMPONENT ==========
function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center"
    >
      <p className="text-gray-500 text-sm">
        🌱 Built with care for a cleaner environment | Smart Waste Collection Robot © 2025
      </p>
    </motion.footer>
  );
}

export default App;
