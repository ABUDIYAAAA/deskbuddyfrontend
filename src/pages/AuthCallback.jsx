import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastProvider';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for error parameters
        const error = searchParams.get('error');
        const errorMessage = searchParams.get('message');
        
        if (error) {
          setError(errorMessage || 'Authentication failed');
          setLoading(false);
          return;
        }

        // Check for success parameters (direct from backend redirect)
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const userParam = searchParams.get('user');

        if (token && refreshToken && userParam) {
          // Direct backend redirect - store tokens and redirect
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            
            // Store auth data using the auth service
            const authService = (await import('../services/auth')).default;
            authService.storeAuthData(token, refreshToken, user);
            
            addToast({
              type: 'success',
              title: 'Login successful!',
              message: `Welcome back, ${user.name || user.email}`,
              duration: 3000
            });

            navigate('/dashboard');
            return;
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            setError('Invalid authentication data');
            setLoading(false);
            return;
          }
        }

        // Check for OAuth authorization code
        const code = searchParams.get('code');
        
        if (code) {
          // Handle OAuth callback with authorization code
          const result = await handleGoogleCallback(code);
          
          if (result.success) {
            addToast({
              type: 'success',
              title: 'Login successful!',
              message: `Welcome, ${result.user.name || result.user.email}`,
              duration: 3000
            });
            
            navigate('/dashboard');
          } else {
            setError('Authentication failed');
          }
        } else {
          setError('No authorization code provided');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        
        addToast({
          type: 'error',
          title: 'Authentication failed',
          message: err.message || 'Please try again',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate, addToast]);

  // Auto redirect to login on error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          borderTop: '3px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>
          Completing Authentication...
        </h2>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Please wait while we sign you in
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '400px'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '20px'
          }}>
            ⚠️
          </div>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '1.5rem' }}>
            Authentication Failed
          </h2>
          <p style={{ margin: '0 0 20px 0', opacity: 0.9 }}>
            {error}
          </p>
          <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>
            Redirecting to login page in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;