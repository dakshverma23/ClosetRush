import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');
        
        if (!token) {
          message.error('Authentication failed. No token received.');
          navigate('/login');
          return;
        }

        // Decode token to get user info (JWT payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Create user object from token payload
        const user = {
          _id: payload.userId,
          userType: payload.userType
        };

        // Store token and user in context
        login(token, user);

        message.success('Login successful!');

        // Redirect based on user type
        if (user.userType === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.userType === 'business') {
          navigate('/business/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        message.error('Authentication failed. Please try again.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
