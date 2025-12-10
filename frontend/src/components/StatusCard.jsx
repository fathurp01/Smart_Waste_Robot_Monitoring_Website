import { motion } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * StatusCard Component
 * Displays connection status and robot online/offline state
 */
const StatusCard = ({ isConnected, lastUpdate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: isConnected ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isConnected ? Infinity : 0,
              ease: "easeInOut"
            }}
            className={`p-3 rounded-xl ${
              isConnected 
                ? 'bg-primary-100 text-primary-600' 
                : 'bg-red-100 text-red-600'
            }`}
          >
            {isConnected ? (
              <Wifi className="w-6 h-6" />
            ) : (
              <WifiOff className="w-6 h-6" />
            )}
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Robot Status
            </h3>
            <p className="text-sm text-gray-500">
              {lastUpdate 
                ? `Last update: ${new Date(lastUpdate).toLocaleTimeString()}`
                : 'Waiting for data...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              opacity: isConnected ? [1, 0.5, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: isConnected ? Infinity : 0,
            }}
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-primary-500' : 'bg-red-500'
            }`}
          />
          <span className={`font-medium ${
            isConnected ? 'text-primary-600' : 'text-red-600'
          }`}>
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * AlertBanner Component
 * Shows alert when bin is full
 */
export const AlertBanner = ({ show, message, type = 'warning' }) => {
  if (!show) return null;

  const styles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };

  const icons = {
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    danger: <AlertCircle className="w-5 h-5 text-red-600" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-2xl border-2 p-4 flex items-center gap-3 ${styles[type]}`}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};

export default StatusCard;
