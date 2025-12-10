import { motion } from 'framer-motion';
import { Trash2, TrendingUp, Clock } from 'lucide-react';

/**
 * CircularProgress Component
 * A beautiful circular gauge showing waste capacity
 */
const CircularProgress = ({ percentage, status }) => {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on capacity level
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
      {/* Background circle */}
      <svg className="transform -rotate-90 w-80 h-80">
        {/* Background track */}
        <circle
          cx="160"
          cy="160"
          r={radius}
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth="20"
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="160"
          cy="160"
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="20"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))'
          }}
        />
      </svg>

      {/* Center content */}
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

/**
 * InfoCard Component
 * Displays key metrics
 */
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

/**
 * HistoryLog Component
 * Shows recent status changes
 */
const HistoryLog = ({ history }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary-600" />
        Recent Activity
      </h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activity yet</p>
        ) : (
          history.slice().reverse().map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                entry.status === 'FULL' ? 'bg-red-500' :
                entry.status === 'NEARLY_FULL' ? 'bg-orange-500' :
                entry.status === 'HALF_FULL' ? 'bg-yellow-500' :
                'bg-primary-500'
              }`} />
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    {entry.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Capacity: {entry.capacity}% | Distance: {entry.distance}cm
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

/**
 * Main Dashboard Component
 * Orchestrates all dashboard elements
 */
const Dashboard = ({ sensorData, isConnected, history }) => {
  const { capacity = 0, status = 'UNKNOWN', distance = 0 } = sensorData;
  
  // Convert to numbers safely
  const distanceNum = Number(distance) || 0;
  const capacityNum = Number(capacity) || 0;

  return (
    <div className="space-y-6">
      {/* Main Metrics Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-linear-to-br from-primary-50 to-emerald-50 rounded-3xl shadow-soft-lg p-8 border border-primary-100"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Circular Progress */}
          <div className="shrink-0">
            <CircularProgress percentage={capacityNum} status={status} />
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:w-auto">
            <InfoCard
              icon={Trash2}
              label="Current Capacity"
              value={`${Math.round(capacityNum)}%`}
              color="primary"
            />
            <InfoCard
              icon={TrendingUp}
              label="Sensor Distance"
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
              value={isConnected ? 'Active' : 'Lost'}
              color={isConnected ? 'primary' : 'orange'}
            />
          </div>
        </div>
      </motion.div>

      {/* History Log */}
      <HistoryLog history={history} />
    </div>
  );
};

export default Dashboard;
