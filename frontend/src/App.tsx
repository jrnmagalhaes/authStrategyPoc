import { useState } from 'react';
import useAuth from './hooks/useAuth';
import useAxiosPrivate from './hooks/useAxiosPrivate';
import { api } from './api/axios';
import './App.css';

function App() {
  const { auth, setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', {
        username: 'user',
        password: 'password'
      });
      setAuth({ accessToken: response.data.accessToken, user: { username: 'user' } });
      console.log('Logged in:', response.data);
    } catch (err: any) {
      setError('Login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
        await api.post('/auth/logout');
        setAuth({});
        setData(null);
    } catch (err: any) {
        console.error('Logout failed', err);
    }
  }

  const getProtectedData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosPrivate.get('/api/protected');
      setData(response.data);
    } catch (err: any) {
      setError('Request failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const refreshManually = async () => {
      // This is just to test the endpoint manually if needed, 
      // but the interceptor handles it automatically.
      try {
          await api.post('/auth/refresh');
          alert('Refresh request sent (check network tab)');
      } catch (err) {
          console.error(err);
      }
  }

  return (
    <div className="card">
      <h1>Auth Strategy POC</h1>
      
      <div className="actions">
        {!auth.accessToken ? (
            <button onClick={login} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
            </button>
        ) : (
            <button onClick={logout}>Logout</button>
        )}
        
        <button onClick={getProtectedData} disabled={loading || !auth.accessToken}>
          Get Protected Data
        </button>

        <button onClick={refreshManually}>
            Manual Refresh (Test)
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="display">
        <h2>Current State</h2>
        <p><strong>Access Token:</strong> {auth.accessToken ? `${auth.accessToken.substring(0, 20)}...` : 'None'}</p>
        
        <h2>Protected Data</h2>
        <pre>{data ? JSON.stringify(data, null, 2) : 'No data fetched'}</pre>
      </div>
    </div>
  );
}

export default App;
