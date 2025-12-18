import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, TrendingUp, Clock, BarChart3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const CircularProgress = ({ percentage, status }) => {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return 'text-red-500';
    if (percentage >= 80) return 'text-orange-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-primary-500';
  };

  const getStrokeColor = () => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f97316';
    if (percentage >= 50) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="relative w-80 h-80 flex items-center justify-center">
      <svg className="transform -rotate-90 w-80 h-80">
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="20"
          fill="none"
        />
        
        <motion.circle
          cx="160"
          cy="160"
          r={radius}
          stroke={getStrokeColor()}
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            filter: `drop-shadow(0 4px 12px ${getStrokeColor()}40)`
          }}
        />
      </svg>

      <div className="absolute flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        >
          <Trash2 className={`w-16 h-16 mb-4 ${getColor()}`} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <div className={`text-6xl font-bold ${getColor()}`}>
            {Math.round(percentage)}%
          </div>
          <div className="text-gray-600 text-lg font-medium mt-2">
            {status.replace('_', ' ')}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, color = 'primary' }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-soft p-6 border border-gray-100 hover:shadow-soft-lg transition-shadow duration-300"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

const DailyVolumeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 text-center text-gray-500"
      >
        Memuat data grafik...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary-600" />
        Grafik Volume Sampah Harian
      </h3>
      
      <div className="space-y-4">
        {data.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {new Date(day.date).toLocaleDateString('id-ID', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </span>
              <span className="text-gray-600">
                Rata-rata: {Math.round(day.avg_capacity)}% | Max: {Math.round(day.max_capacity)}%
              </span>
            </div>
            
            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${(day.avg_capacity / 100) * 100}%`,
                  background: day.avg_capacity >= 80 
                    ? 'linear-gradient(90deg, #f97316, #ef4444)' 
                    : day.avg_capacity >= 50 
                    ? 'linear-gradient(90deg, #eab308, #f97316)' 
                    : 'linear-gradient(90deg, #22c55e, #10b981)'
                }}
              />
              
              <div 
                className="absolute h-full w-1 bg-red-600"
                style={{
                  left: `${(day.max_capacity / 100) * 100}%`
                }}
                title={`Max: ${Math.round(day.max_capacity)}%`}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{day.readings} pembacaan</span>
              <span>
                {day.full_count > 0 && `🔴 ${day.full_count}x penuh `}
                {day.nearly_full_count > 0 && `🟠 ${day.nearly_full_count}x hampir penuh`}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const Dashboard = ({ sensorData, isConnected, history }) => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { capacity = 0, status = 'UNKNOWN', distance = 0 } = sensorData;
  
  const distanceNum = Number(distance) || 0;
  const capacityNum = Number(capacity) || 0;

  useEffect(() => {
    fetchDailyData();
    const interval = setInterval(fetchDailyData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDailyData = async () => {
    try {
      const params = new URLSearchParams();
      params.append('days', 7);

      const response = await fetch(`${API_URL}/api/history/daily?${params}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
      });
      
      const result = await response.json();

      if (result.success) {
        setDailyData(result.data);
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-linear-to-br from-primary-50 to-emerald-50 rounded-3xl shadow-soft-lg p-8 border border-primary-100"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="shrink-0">
            <CircularProgress percentage={capacityNum} status={status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
            <InfoCard
              icon={Trash2}
              label="Current Capacity"
              value={`${Math.round(capacityNum)}%`}
              color="primary"
            />
            <InfoCard
              icon={TrendingUp}
              label="Distance (Realtime)"
              value={`${distanceNum.toFixed(1)} cm`}
              color="blue"
            />
            <InfoCard
              icon={Clock}
              label="Status"
              value={status.replace('_', ' ')}
              color={capacityNum >= 80 ? 'orange' : 'primary'}
            />
            <InfoCard
              icon={Trash2}
              label="Connection"
              value={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'primary' : 'orange'}
            />
          </div>
        </div>
      </motion.div>

      <DailyVolumeChart data={dailyData} />
    </div>
  );
};

export default Dashboard;