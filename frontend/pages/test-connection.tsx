import { useState } from 'react';
import { api, testConnection, testConnectionNoCredentials } from '../lib/api';
import { Button } from '../components/Button';

export default function TestConnection() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    
    console.log('🧪 Testing connection...');
    console.log('🔧 API Base URL:', api.defaults.baseURL);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('🔑 API Base from env:', process.env.NEXT_PUBLIC_API_BASE);
    
    try {
      const connectionResult = await testConnection();
      setResult(connectionResult);
    } catch (error: any) {
      console.error('Test failed:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing direct fetch...');
      const testUrl = `${api.defaults.baseURL}/api/health`;
      console.log('🔗 URL:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Direct fetch result:', data);
      setResult({ success: true, data, method: 'direct fetch', status: response.status });
    } catch (error: any) {
      console.error('❌ Direct fetch failed:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setResult({ 
        success: false, 
        error: error.message, 
        method: 'direct fetch',
        errorType: error.name
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Backend Connection Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API Base URL:</strong> {api.defaults.baseURL}</p>
            <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            <p><strong>NEXT_PUBLIC_API_BASE:</strong> {process.env.NEXT_PUBLIC_API_BASE}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={async () => {
              setLoading(true);
              try {
                // Test complete authentication flow
                console.log('🔐 Testing complete auth flow...');
                console.log('🌐 API Base URL:', api.defaults.baseURL);
                console.log('🍪 With credentials:', api.defaults.withCredentials);
                
                // Step 1: Test registration first
                const testEmail = `test${Date.now()}@example.com`;
                const testPassword = 'testpassword123';
                
                console.log('📝 Step 1: Testing registration...');
                const registerResponse = await api.post('/api/auth/register', { 
                  email: testEmail, 
                  password: testPassword 
                });
                console.log('✅ Registration response:', registerResponse.data);
                
                // Step 2: Test protected endpoint immediately after registration
                console.log('🔒 Step 2: Testing /users/me after registration...');
                const meResponse = await api.get('/api/users/me');
                console.log('✅ /users/me response:', meResponse.data);
                
                // Step 3: Test dashboard endpoint
                console.log('📊 Step 3: Testing /users/dashboard...');
                const dashboardResponse = await api.get('/api/users/dashboard');
                console.log('✅ Dashboard response:', dashboardResponse.data);
                
                setResult({ 
                  success: true, 
                  message: 'Complete auth flow works', 
                  method: 'complete-auth-test',
                  steps: {
                    registration: registerResponse.data,
                    userMe: meResponse.data,
                    dashboard: dashboardResponse.data
                  }
                });
              } catch (error: any) {
                console.error('🔐 Auth flow test failed:', error);
                setResult({ 
                  success: false, 
                  error: error.response?.data?.error || error.message, 
                  method: 'complete-auth-test',
                  status: error.response?.status,
                  details: error.response?.data,
                  step: error.config?.url
                });
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
            variant="secondary"
            className="w-full"
          >
            🔐 Test Complete Auth Flow
          </Button>
          
          <Button 
            onClick={async () => {
              setLoading(true);
              try {
                // Test existing user login
                console.log('🔑 Testing existing user login...');
                const loginResponse = await api.post('/api/auth/login', { 
                  email: 'test@example.com', 
                  password: 'testpassword123' 
                });
                console.log('✅ Login response:', loginResponse.data);
                
                // Test protected endpoint
                const meResponse = await api.get('/api/users/me');
                console.log('✅ /users/me response:', meResponse.data);
                
                setResult({ 
                  success: true, 
                  message: 'Login flow works', 
                  method: 'login-test',
                  loginData: loginResponse.data,
                  userData: meResponse.data
                });
              } catch (error: any) {
                console.error('🔐 Login test failed:', error);
                setResult({ 
                  success: false, 
                  error: error.response?.data?.error || error.message, 
                  method: 'login-test',
                  status: error.response?.status,
                  details: error.response?.data
                });
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
            variant="outline"
            className="w-full"
          >
            🔑 Test Existing User Login
          </Button>
          
          <Button 
            onClick={async () => {
              setLoading(true);
              try {
                // Simple ping test
                console.log('🏓 Testing basic connectivity...');
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(`${api.defaults.baseURL}/api/health`, {
                  signal: controller.signal,
                  mode: 'no-cors' // This will bypass CORS for basic connectivity test
                });
                
                clearTimeout(timeoutId);
                console.log('🏓 Basic connectivity: OK');
                setResult({ success: true, message: 'Basic connectivity works', method: 'ping' });
              } catch (error: any) {
                console.error('🏓 Basic connectivity failed:', error);
                if (error.name === 'AbortError') {
                  setResult({ success: false, error: 'Timeout - Railway backend not responding', method: 'ping' });
                } else {
                  setResult({ success: false, error: error.message, method: 'ping' });
                }
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
            variant="outline"
            className="w-full"
          >
            🏓 Test Basic Connectivity
          </Button>
          
          <Button 
            onClick={testDirectFetch} 
            loading={loading}
            variant="outline"
            className="w-full"
          >
            Test Direct Fetch (CORS)
          </Button>
          
          <Button 
            onClick={handleTest} 
            loading={loading}
            className="w-full"
          >
            Test Axios Connection
          </Button>
          
          <Button 
            onClick={async () => {
              setLoading(true);
              const result = await testConnectionNoCredentials();
              setResult(result);
              setLoading(false);
            }} 
            loading={loading}
            variant="ghost"
            className="w-full"
          >
            Test Without Credentials
          </Button>
        </div>

        {result && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              {result.success ? '✅ Success' : '❌ Failed'}
            </h3>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}