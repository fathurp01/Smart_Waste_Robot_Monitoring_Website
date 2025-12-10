/**
 * MySQL Database Configuration and Connection
 */

const mysql = require('mysql2/promise');

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_waste_robot',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
let pool;

/**
 * Initialize database connection and create tables if they don't exist
 */
async function initializeDatabase() {
  try {
    // Create connection without database first
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database '${dbConfig.database}' ready`);
    await connection.end();

    // Create connection pool with database
    pool = mysql.createPool(dbConfig);

    // Create sensor_data table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distance DECIMAL(5,2) NOT NULL,
        capacity INT NOT NULL,
        status VARCHAR(20) NOT NULL,
        robot_online BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_capacity (capacity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Table "sensor_data" ready');
    console.log(`📊 Database connection pool created (max ${dbConfig.connectionLimit} connections)`);
    
    return pool;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

/**
 * Save sensor data to database
 */
async function saveSensorData(data) {
  try {
    const { distance, capacity, status, robotOnline } = data;
    
    const [result] = await pool.query(
      'INSERT INTO sensor_data (distance, capacity, status, robot_online) VALUES (?, ?, ?, ?)',
      [distance, capacity, status, robotOnline]
    );

    return result.insertId;
  } catch (error) {
    console.error('❌ Error saving sensor data:', error.message);
    throw error;
  }
}

/**
 * Get history data with filters and pagination
 */
async function getHistoryData(filters = {}) {
  try {
    const {
      status,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let query = 'SELECT * FROM sensor_data WHERE 1=1';
    const params = [];

    // Apply status filter
    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    // Apply date range filter
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    // Apply sorting
    const allowedSortFields = ['created_at', 'capacity', 'status'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    // Apply pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM sensor_data WHERE 1=1';
    const countParams = [];

    if (status && status !== 'ALL') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (startDate) {
      countQuery += ' AND created_at >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND created_at <= ?';
      countParams.push(endDate);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < total
      }
    };
  } catch (error) {
    console.error('❌ Error getting history data:', error.message);
    throw error;
  }
}

/**
 * Get statistics summary
 */
async function getStatistics(filters = {}) {
  try {
    const { startDate, endDate } = filters;

    let query = `
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'FULL' THEN 1 ELSE 0 END) as full_count,
        SUM(CASE WHEN status = 'NEARLY_FULL' THEN 1 ELSE 0 END) as nearly_full_count,
        SUM(CASE WHEN status = 'HALF_FULL' THEN 1 ELSE 0 END) as half_full_count,
        SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) as available_count,
        AVG(capacity) as avg_capacity,
        MAX(capacity) as max_capacity,
        MIN(capacity) as min_capacity
      FROM sensor_data
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
  } catch (error) {
    console.error('❌ Error getting statistics:', error.message);
    throw error;
  }
}

/**
 * Get latest sensor data
 */
async function getLatestData() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1'
    );
    return rows[0] || null;
  } catch (error) {
    console.error('❌ Error getting latest data:', error.message);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeDatabase() {
  if (pool) {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

module.exports = {
  initializeDatabase,
  saveSensorData,
  getHistoryData,
  getStatistics,
  getLatestData,
  closeDatabase,
  getPool: () => pool
};
