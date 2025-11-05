import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/Button';
import { useRouter } from 'next/router';
export default function AuthDebug() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const addResult = (step: string, success: boolean, data: any) => {
    setResults(prev => [...prev, { step, success, data, timestamp: new Date().toISOString() }]);
  };
  const testAuthFlow = async () => {
    setLoading(true);
    setResults([]);

    try {
      addResult('Initial State', true, {
        userInStore: !!user,
        tokenInLocalStorage: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : false,
        apiBaseUrl: api.defaults.baseURL
      });

      try {
        const authTest = await api.get('/api/auth/test');
        addResult('Auth Test', true, authTest.data);
      } catch (error: any) {
        addResult('Auth Test', false, {
          status: error.response?.status,
          error: error.response?.data?.error || error.message
        });
      }

      try {
        const meResponse = await api.get('/api/users/me');
        addResult('Users Me', true, meResponse.data);
      } catch (error: any) {
        addResult('Users Me', false, {
          status: error.response?.status,
          error: error.response?.data?.error || error.message
        });
      }

      try {
        const dashboardResponse = await api.get('/api/users/dashboard');
        addResult('Dashboard', true, dashboardResponse.data);
      } catch (error: any) {
        addResult('Dashboard', false, {
          status: error.response?.status,
          error: error.response?.data?.error || error.message
        });
      }

    } catch (error) {
      addResult('General Error', false, error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'testpassword123';

      const registerResponse = await api.post('/api/auth/register', {
        email: testEmail,
        password: testPassword
      });

      addResult('Registration', true, registerResponse.data);

      if (registerResponse.data.token && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', registerResponse.data.token);
        addResult('Token Storage', true, { tokenStored: true });
      }

      setUser(registerResponse.data.user);
      addResult('User Store Update', true, { userSet: true });

      await testAuthFlow();

    } catch (error: any) {
      addResult('Login Test', false, {
        status: error.response?.status,
        error: error.response?.data?.error || error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Authentication Debug
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current State</h2>
          <div className="space-y-2 text-sm">
            <p><strong>User in Store:</strong> {user ? `${user.email} (${user.id})` : 'None'}</p>
            <p><strong>Token in localStorage:</strong> {typeof window !== 'undefined' && localStorage.getItem('auth_token') ? 'Yes' : 'No'}</p>
            <p><strong>API Base URL:</strong> {api.defaults.baseURL}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <Button onClick={testAuthFlow} loading={loading} className="w-full">
            Test Current Authentication
          </Button>
          
          <Button onClick={testLogin} loading={loading} variant="secondary" className="w-full">
            Test Complete Login Flow
          </Button>

          <Button 
            onClick={() => router.push('/dashboard')} 
            variant="outline" 
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>

        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center mb-2">
                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <strong>{result.step}</strong>
                    <span className="ml-auto text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}