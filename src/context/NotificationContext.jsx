import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const initial = [
      {
        id: 1,
        title: 'Price Drop Alert',
        message: 'Sony WH-1000XM5 ANC Headphones dropped by 20%!',
        time: '5 mins ago',
        unread: true,
        type: 'price_drop'
      },
      {
        id: 2,
        title: 'Outbid Notification',
        message: 'You have been outbid on [Simulated] Sony PlayStation 5 Pro.',
        time: '2 hours ago',
        unread: true,
        type: 'auction'
      },
      {
        id: 3,
        title: 'Group Buy Progress',
        message: 'Keychron K2 Keyboard Group Buy is now 70% full!',
        time: '1 day ago',
        unread: false,
        type: 'group_buy'
      }
    ];
    
    const saved = localStorage.getItem('one8_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications(initial);
      }
    } else {
      setNotifications(initial);
      localStorage.setItem('one8_notifications', JSON.stringify(initial));
    }
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, unread: false }));
    setNotifications(updated);
    localStorage.setItem('one8_notifications', JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    localStorage.setItem('one8_notifications', JSON.stringify([]));
  };

  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      time: 'Just now',
      unread: true,
      type
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('one8_notifications', JSON.stringify(updated));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAllAsRead, clearNotifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
