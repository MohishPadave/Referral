import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api } from '../lib/api';
import { motion } from 'framer-motion';

type Trends = { date: string; referred: number; converted: number; credits: number }[];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export function ReferralCharts() {
  const [data, setData] = useState<Trends>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState<'line' | 'bar' | 'pie'>('line');

  useEffect(() => {
    (async () => {
      try {
        // Simple client-side synthesis using dashboard + history
        const hist = await api.get('/api/credits/history');
        const byDay: Record<string, { referred: number; converted: number; credits: number }> = {};
        
        for (const h of hist.data.history as any[]) {
          const d = new Date(h.createdAt).toISOString().slice(0, 10);
          byDay[d] ||= { referred: 0, converted: 0, credits: 0 };
          if (h.delta > 0) byDay[d].credits += h.delta;
        }
        
        const rows = Object.entries(byDay)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, v]) => ({ 
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
            referred: v.referred, 
            converted: v.converted, 
            credits: v.credits 
          }));
        
        setData(rows);
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pieData = [
    { name: 'Active Referrals', value: data.reduce((sum, d) => sum + d.referred, 0), color: COLORS[0] },
    { name: 'Converted', value: data.reduce((sum, d) => sum + d.converted, 0), color: COLORS[1] },
    { name: 'Pending', value: Math.max(0, data.reduce((sum, d) => sum + d.referred - d.converted, 0)), color: COLORS[2] },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg mr-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Overview</h2>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'line', icon: '📈', label: 'Trends' },
            { key: 'bar', icon: '📊', label: 'Daily' },
            { key: 'pie', icon: '🥧', label: 'Summary' }
          ].map((chart) => (
            <button
              key={chart.key}
              onClick={() => setActiveChart(chart.key as any)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-md transition-all
                ${activeChart === chart.key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <span className="mr-1">{chart.icon}</span>
              {chart.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            <p>No data available yet</p>
            <p className="text-sm mt-1">Start referring friends to see your analytics</p>
          </div>
        </div>
      ) : (
        <div className="h-80">
          {activeChart === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="credits" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="referred" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          
          {activeChart === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="credits" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="referred" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          
          {activeChart === 'pie' && pieData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </motion.div>
  );
}


