import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getTodayString, isTimestampInDateRange } from '../utils/dateUtils';

const DeliveryContext = createContext();

const STORAGE_KEYS = {
  ORDERS: 'delivery_tracker_orders_v2',
  RIDERS: 'delivery_tracker_riders_v2',
  AUTH: 'delivery_tracker_auth_v2',
};

const DEFAULT_RIDERS = ['yowas', 'onesphore', 'paul', 'fred', 'uzziah', 'valens'];
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function DeliveryProvider({ children }) {
  // --- Auth State ---
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.loginTime && Date.now() - parsed.loginTime < SESSION_DURATION_MS) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading auth from localStorage', e);
    }
    return { user: null, role: null, loginTime: null };
  });

  // --- Date Range Filter State ---
  const today = getTodayString();
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today,
  });

  // --- Riders State ---
  const [riders, setRiders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading riders', e);
    }
    return DEFAULT_RIDERS;
  });

  // --- Orders State ---
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading orders', e);
    }
    return [];
  });

  // --- Broadcast Channel Setup ---
  useEffect(() => {
    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('delivery_tracker_sync');
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SYNC_ORDERS') {
          setOrders(payload);
        } else if (type === 'SYNC_RIDERS') {
          setRiders(payload);
        }
      };
    }

    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === STORAGE_KEYS.RIDERS && e.newValue) {
        try {
          setRiders(JSON.parse(e.newValue));
        } catch (err) {}
      }
      if (e.key === STORAGE_KEYS.AUTH && e.newValue) {
        try {
          setAuth(JSON.parse(e.newValue));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // Broadcast helper
  const broadcastSync = (type, payload) => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('delivery_tracker_sync');
        channel.postMessage({ type, payload });
        channel.close();
      } catch (e) {}
    }
  };

  // --- Persist Orders ---
  const updateOrders = useCallback((newOrders) => {
    setOrders(newOrders);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
    broadcastSync('SYNC_ORDERS', newOrders);
  }, []);

  // --- Persist Riders ---
  const updateRiders = useCallback((newRiders) => {
    setRiders(newRiders);
    localStorage.setItem(STORAGE_KEYS.RIDERS, JSON.stringify(newRiders));
    broadcastSync('SYNC_RIDERS', newRiders);
  }, []);

  // --- Login / Logout ---
  const login = useCallback((username, password) => {
    if (username === 'admin' && password === 'nihemart@2026') {
      const newAuth = { user: 'admin', role: 'admin', loginTime: Date.now() };
      setAuth(newAuth);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuth));
      return { success: true, role: 'admin' };
    }
    if (username === 'user' && password === 'nihemart@20266') {
      const newAuth = { user: 'user', role: 'viewer', loginTime: Date.now() };
      setAuth(newAuth);
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuth));
      return { success: true, role: 'viewer' };
    }
    return { success: false, error: 'Invalid username or password' };
  }, []);

  const logout = useCallback(() => {
    const newAuth = { user: null, role: null, loginTime: null };
    setAuth(newAuth);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }, []);

  // --- Timer Ticking & Live Overdue Detection ---
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatically update status to 'overdue' if timer expired while in transit
  useEffect(() => {
    let hasChanges = false;
    const updated = orders.map((order) => {
      if (order.status === 'in_transit' && order.startedAt && order.timerDurationSeconds) {
        const started = new Date(order.startedAt).getTime();
        const expiresAt = started + order.timerDurationSeconds * 1000;
        if (now >= expiresAt) {
          hasChanges = true;
          return {
            ...order,
            status: 'overdue',
          };
        }
      }
      return order;
    });

    if (hasChanges) {
      updateOrders(updated);
    }
  }, [now, orders, updateOrders]);

  // --- Add Rider ---
  const addRider = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (riders.some((r) => r.toLowerCase() === trimmed.toLowerCase())) {
      return true; // Already exists
    }
    const updated = [...riders, trimmed];
    updateRiders(updated);
    return true;
  }, [riders, updateRiders]);

  // --- Create Order ---
  const createOrder = useCallback(({ orderNumber, driver, timerDurationSeconds }) => {
    const nowIso = new Date().toISOString();
    const newOrder = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      orderNumber: Number(orderNumber),
      orderLabel: `Order ${orderNumber}`,
      driver: driver || 'Unassigned',
      status: 'in_transit',
      createdAt: nowIso,
      startedAt: nowIso,
      timerDurationSeconds: Number(timerDurationSeconds),
      deliveredAt: null,
      totalTimeTakenSeconds: null,
      overdueBySeconds: null,
      isRemovedFromActive: false,
    };

    const updated = [newOrder, ...orders];
    updateOrders(updated);
    return newOrder;
  }, [orders, updateOrders]);

  // --- Change Order Status ---
  const setOrderStatus = useCallback((orderId, newStatus) => {
    const nowIso = new Date().toISOString();
    const nowTime = new Date(nowIso).getTime();

    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;

      let deliveredAt = order.deliveredAt;
      let totalTimeTakenSeconds = order.totalTimeTakenSeconds;
      let overdueBySeconds = order.overdueBySeconds;

      if (newStatus === 'delivered') {
        deliveredAt = deliveredAt || nowIso;
        const createdTime = new Date(order.createdAt).getTime();
        totalTimeTakenSeconds = Math.max(0, Math.floor((nowTime - createdTime) / 1000));

        if (order.startedAt && order.timerDurationSeconds) {
          const startedTime = new Date(order.startedAt).getTime();
          const expectedEnd = startedTime + order.timerDurationSeconds * 1000;
          if (nowTime > expectedEnd) {
            overdueBySeconds = Math.floor((nowTime - expectedEnd) / 1000);
          } else {
            overdueBySeconds = 0;
          }
        }
      } else if (newStatus === 'in_transit') {
        deliveredAt = null;
        totalTimeTakenSeconds = null;
        overdueBySeconds = null;
      } else if (newStatus === 'failed') {
        deliveredAt = null;
      }

      return {
        ...order,
        status: newStatus,
        deliveredAt,
        totalTimeTakenSeconds,
        overdueBySeconds,
      };
    });

    updateOrders(updated);
  }, [orders, updateOrders]);

  // --- Mark Delivered ---
  const markDelivered = useCallback((orderId) => {
    setOrderStatus(orderId, 'delivered');
  }, [setOrderStatus]);

  // --- Soft Remove Order from Active List ---
  const removeOrder = useCallback((orderId) => {
    const updated = orders.map((ord) => {
      if (ord.id === orderId) {
        return { ...ord, isRemovedFromActive: true };
      }
      return ord;
    });
    updateOrders(updated);
  }, [orders, updateOrders]);

  // --- Active Order Numbers locked/disabled ---
  const lockedOrderNumbers = useMemo(() => {
    const set = new Set();
    orders.forEach((order) => {
      if (!order.isRemovedFromActive && (order.status === 'in_transit' || order.status === 'overdue')) {
        set.add(Number(order.orderNumber));
      }
    });
    return set;
  }, [orders]);

  // --- Filtered Orders by Calendar Date / Date Range ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      isTimestampInDateRange(order.createdAt, dateRange.startDate, dateRange.endDate)
    );
  }, [orders, dateRange]);

  // --- Stat Cards Calculations (Card 0) ---
  const stats = useMemo(() => {
    let totalOrders = 0;
    let inTransit = 0;
    let totalDelivered = 0;
    let totalOverdue = 0;
    let totalFailed = 0;

    filteredOrders.forEach((order) => {
      if (order.startedAt) totalOrders++;

      if (!order.isRemovedFromActive) {
        if (order.status === 'in_transit') inTransit++;
        if (order.status === 'delivered') totalDelivered++;
        if (order.status === 'overdue') totalOverdue++;
        if (order.status === 'failed') totalFailed++;
      } else {
        // Soft removed historical status counts
        if (order.status === 'delivered') totalDelivered++;
        if (order.status === 'failed') totalFailed++;
      }
    });

    return {
      totalOrders,
      inTransit,
      totalDelivered,
      totalOverdue,
      totalFailed,
    };
  }, [filteredOrders]);

  const value = {
    auth,
    login,
    logout,
    dateRange,
    setDateRange,
    riders,
    addRider,
    orders,
    filteredOrders,
    stats,
    now,
    lockedOrderNumbers,
    createOrder,
    setOrderStatus,
    markDelivered,
    removeOrder,
  };

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
}
