import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function History() {
  const [historyData, setHistoryData] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'ALL',
    startDate: '',
    endDate: '',
    limit: 100,
    offset: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
    hasMore: false
  });

  // Status options
  const statusOptions = [
    { value: 'ALL', label: 'Semua Status', icon: '📊' },
    { value: 'FULL', label: 'Penuh', icon: '🔴', priority: true },
    { value: 'NEARLY_FULL', label: 'Hampir Penuh', icon: '🟠' },
    { value: 'HALF_FULL', label: 'Setengah Penuh', icon: '🟡' },
    { value: 'AVAILABLE', label: 'Tersedia', icon: '🟢' }
  ];

  // Fetch history data
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', filters.limit);
      params.append('offset', filters.offset);

      const response = await fetch(`${API_URL}/api/history?${params}`);
      const result = await response.json();

      if (result.success) {
        setHistoryData(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`${API_URL}/api/history/stats?${params}`);
      const result = await response.json();

      if (result.success) {
        setStatistics(result.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Load data on mount and filter changes
  useEffect(() => {
    fetchHistory();
    fetchStatistics();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePagination = (direction) => {
    setFilters(prev => ({
      ...prev,
      offset: direction === 'next' 
        ? prev.offset + prev.limit 
        : Math.max(0, prev.offset - prev.limit)
    }));
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Tanggal', 'Waktu', 'Jarak (cm)', 'Kapasitas (%)', 'Status', 'Robot Online'];
    const rows = historyData.map(item => [
      new Date(item.created_at).toLocaleDateString('id-ID'),
      new Date(item.created_at).toLocaleTimeString('id-ID'),
      item.distance,
      item.capacity,
      item.status,
      item.robot_online ? 'Ya' : 'Tidak'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `history_sampah_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Format date/time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'FULL': return 'text-red-600 bg-red-50';
      case 'NEARLY_FULL': return 'text-orange-600 bg-orange-50';
      case 'HALF_FULL': return 'text-yellow-600 bg-yellow-50';
      case 'AVAILABLE': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? `${option.icon} ${option.label}` : status;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar className="text-primary-500" />
            Riwayat Data Sensor
          </h1>
          <p className="text-gray-600 mt-2">
            Lihat dan analisis data historis sensor kapasitas tempat sampah
          </p>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Data</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.total_records}</p>
                </div>
                <TrendingUp className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-red-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status Penuh</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.full_count}</p>
                </div>
                <AlertTriangle className="text-red-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hampir Penuh</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.nearly_full_count}</p>
                </div>
                <AlertTriangle className="text-orange-500" size={32} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rata-rata</p>
                  <p className="text-2xl font-bold text-green-600">{Math.round(statistics.avg_capacity)}%</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-primary-500" />
            <h2 className="text-xl font-semibold text-gray-800">Filter Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                    {option.priority && ' ⭐'}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Limit Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data per Halaman
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                fetchHistory();
                fetchStatistics();
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={historyData.length === 0}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-primary-500 to-emerald-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Waktu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Jarak (cm)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kapasitas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Robot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <RefreshCw className="animate-spin text-primary-500" size={24} />
                        <span className="text-gray-600">Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : historyData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada data yang ditemukan
                    </td>
                  </tr>
                ) : (
                  historyData.map((item, index) => {
                    const { date, time } = formatDateTime(item.created_at);
                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {filters.offset + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {time}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-800">
                          {item.distance}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${
                                  item.capacity >= 100 ? 'bg-red-500' :
                                  item.capacity >= 80 ? 'bg-orange-500' :
                                  item.capacity >= 50 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${item.capacity}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {item.capacity}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            item.robot_online 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.robot_online ? '🟢 Online' : '⚫ Offline'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && historyData.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Menampilkan {filters.offset + 1} - {Math.min(filters.offset + filters.limit, pagination.total)} dari {pagination.total} data
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePagination('prev')}
                  disabled={filters.offset === 0}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
                >
                  ← Sebelumnya
                </button>
                <button
                  onClick={() => handlePagination('next')}
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
