import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { StatCard } from '../components/StatCard';
import { CopyReferral } from '../components/CopyReferral';
import { Button } from '../components/Button';
import { Leaderboard } from '../components/Leaderboard';
import { ReferralCharts } from '../components/ReferralCharts';
import { ActivityFeed } from '../components/ActivityFeed';
import { RedeemCredits } from '../components/RedeemCredits';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, setUser, stats, setStats, setError } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log(' Dashboard loading...');
        console.log('Current user in store:', user);
        console.log('Token in localStorage:', typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false);
        
        if (!user) {
          console.log(' Fetching user data from /users/me...');
          const me = await api.get('/api/users/me');
          console.log('User data received:', me.data.user);
          setUser(me.data.user);
        }
        
        console.log('Fetching dashboard stats...');
        const s = await api.get('/api/users/dashboard');
        console.log(' Dashboard stats received:', s.data.stats);
        setStats(s.data.stats);
        
      } catch (error: any) {
        console.error('Dashboard loading error:', error);
        console.error('Error details:', {
          status: error.response?.status,
          message: error.response?.data?.error || error.message,
          url: error.config?.url
        });
        
        if (error.response?.status === 401) {
          console.log('Authentication error - redirecting to login');
          setError('Please log in');
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
        } else {
          console.log(' Non-auth error - staying on dashboard');
          setError(`Error loading dashboard: ${error.response?.data?.error || error.message}`);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [setUser, setStats, setError, user]);

  const onBuy = async () => {
    try {
      setPurchasing(true);
      console.log('Making purchase request...');
      console.log('API base URL:', api.defaults.baseURL);
      console.log('With credentials:', api.defaults.withCredentials);
      
      const purchaseResponse = await api.post('/api/purchases', { amount: 10 });
      console.log('Purchase response:', purchaseResponse.data);
      
      const s = await api.get('/api/users/dashboard');
      console.log('Updated stats:', s.data.stats);
      setStats(s.data.stats);
      
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      notification.textContent = purchaseResponse.data.referralProcessed 
        ? 'Purchase successful! You and your referrer both received 2 credits!' 
        : 'Purchase successful! Credits updated.';
      document.body.appendChild(notification);
      setTimeout(() => document.body.removeChild(notification), 3000);
    } catch (e: any) {
      console.error('Purchase error:', e);
      console.error('Error response:', e.response);
      alert(e.response?.data?.error ?? e.message ?? 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !stats) return null;

  return (
    <Layout showHeader>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here&apos;s your referral performance overview
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Referred" 
            value={stats.totalReferred}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            }
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Converted" 
            value={stats.convertedCount}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            color="green"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            title="Total Credits" 
            value={stats.totalCredits}
            icon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            }
            color="purple"
            trend={{ value: 25, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Referral Link</h2>
              </div>
              <CopyReferral link={stats.referralLink} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg mr-3">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Test Purchase</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Make a purchase to test referral credits (both you and referrer get 2 credits each)</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={onBuy}
                loading={purchasing}
                size="lg"
                className="w-full sm:w-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Buy Product ($10)
              </Button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ReferralCharts />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Leaderboard />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ActivityFeed />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <RedeemCredits />
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


