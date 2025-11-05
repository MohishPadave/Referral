import { useState } from 'react';
import { api } from '../lib/api';
import { Button } from './Button';
import { motion } from 'framer-motion';

const rewardOptions = [
  { id: 'coupon', name: 'Discount Coupon', cost: 5, icon: '🎫' },
  { id: 'gift-card', name: 'Gift Card', cost: 10, icon: '🎁' },
  { id: 'premium', name: 'Premium Access', cost: 15, icon: '⭐' },
  { id: 'merchandise', name: 'Merchandise', cost: 20, icon: '👕' },
];

export function RedeemCredits() {
  const [selectedReward, setSelectedReward] = useState(rewardOptions[0]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onRedeem = async () => {
    try {
      setLoading(true);
      await api.post('/api/credits/redeem', { 
        amount: selectedReward.cost, 
        item: selectedReward.name 
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      alert(e.response?.data?.error ?? 'Redeem failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg mr-3">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Redeem Credits</h2>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-800 dark:text-green-200">
              Successfully redeemed {selectedReward.name}!
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Choose your reward:
          </label>
          <div className="grid grid-cols-1 gap-3">
            {rewardOptions.map((reward) => (
              <motion.button
                key={reward.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedReward(reward)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${selectedReward.id === reward.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {reward.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {reward.cost} credits required
                      </p>
                    </div>
                  </div>
                  {selectedReward.id === reward.id && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedReward.name}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedReward.cost} credits
            </span>
          </div>
          
          <Button 
            onClick={onRedeem} 
            loading={loading}
            fullWidth
            size="lg"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            Redeem Now
          </Button>
        </div>
      </div>
    </div>
  );
}


