import { useRouter } from 'next/router';
import { useState, useMemo } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { RegisterSchema } from '../utils/validation';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { Layout } from '../components/Layout';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const refFromUrl = typeof router.query.ref === 'string' ? router.query.ref : undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState(refFromUrl ?? '');
  const { setUser, setError, setLoading, loading, error } = useAuthStore();

  const errors = useMemo(() => {
    const res = RegisterSchema.safeParse({ email, password, referralCode: referralCode || undefined });
    if (res.success) return {} as Record<string, string>;
    const map: Record<string, string> = {};
    for (const e of res.error.issues) map[e.path.join('.')] = e.message;
    return map;
  }, [email, password, referralCode]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (Object.keys(errors).length) return;
    try {
      setLoading(true);
      console.log('Attempting signup with:', { email, password: '***', referralCode });
      console.log('API base URL:', api.defaults.baseURL);
      
      const { data } = await api.post('/auth/register', { email, password, referralCode: referralCode || undefined });
      console.log('Signup successful:', data);
      setUser(data.user);
      
      // Store token in localStorage as fallback for cookie issues
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log('🔑 Token stored in localStorage');
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.error ?? err.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Join ReferralHub
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your account and start earning rewards
            </p>
            {refFromUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Referred by a friend
              </motion.div>
            )}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                >
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </motion.div>
              )}

              <Input 
                label="Email Address" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                error={errors.email}
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                }
                placeholder="Enter your email"
              />
              
              <Input 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                error={errors.password}
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                }
                placeholder="Create a strong password"
              />

              <Input 
                label="Referral Code (Optional)" 
                value={referralCode} 
                onChange={(e) => setReferralCode(e.target.value)}
                icon={
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                }
                placeholder="Enter referral code if you have one"
              />

              <Button 
                type="submit" 
                loading={loading}
                fullWidth
                size="lg"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <Button variant="outline" fullWidth>
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}


