import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const BackButton = ({ to, label = 'Back', className = '', style = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (to) {
      // If a specific route is provided, navigate to it
      navigate(to);
    } else {
      // Otherwise, go back in history
      // But if we're on the home page, don't do anything
      if (location.pathname !== '/') {
        navigate(-1);
      }
    }
  };

  // Don't show back button on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Button
      type="text"
      icon={<ArrowLeftOutlined />}
      onClick={handleBack}
      className={`flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium ${className}`}
      style={{
        padding: '8px 16px',
        borderRadius: '12px',
        ...style
      }}
    >
      {label}
    </Button>
  );
};

export default BackButton;
