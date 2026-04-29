import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Badge, Dropdown, Button, List, Typography, Empty } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Text } = Typography;

// Relative time helper
const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      // Silently fail — don't disrupt the UI if notifications fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    intervalRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalRef.current);
  }, [fetchNotifications]);

  const handleMarkRead = async (notification) => {
    if (notification.read) return;
    try {
      await api.patch(`/notifications/${notification._id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      // Silently fail
    }
  };

  const dropdownContent = (
    <div
      style={{
        width: 360,
        maxHeight: 480,
        overflowY: 'auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: '1px solid #f0f0f0'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15 }}>Notifications</span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleMarkAllRead}
            style={{ padding: 0, fontSize: 12 }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div style={{ padding: '32px 16px' }}>
          <Empty description="No notifications" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <List
          dataSource={notifications.slice(0, 10)}
          renderItem={(item) => (
            <List.Item
              key={item._id}
              onClick={() => handleMarkRead(item)}
              style={{
                padding: '12px 16px',
                cursor: item.read ? 'default' : 'pointer',
                background: item.read ? '#fff' : '#f0f5ff',
                borderBottom: '1px solid #f5f5f5',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: item.read ? 400 : 600,
                      color: item.read ? '#595959' : '#1a1a1a',
                      flex: 1
                    }}
                  >
                    {item.message}
                  </Text>
                  {!item.read && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#4f46e5',
                        flexShrink: 0,
                        marginTop: 4
                      }}
                    />
                  )}
                </div>
                <Text style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4, display: 'block' }}>
                  {relativeTime(item.createdAt)}
                </Text>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-label="Notifications"
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
