import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { isTimestampInDateRange } from '../utils/dateUtils';

const DeliveryContext = createContext();

const STORAGE_KEYS = {
  ORDERS: 'delivery_tracker_orders_v2',
  RIDERS: 'delivery_tracker_riders_v2',
  AUTH: 'delivery_tracker_auth_v2',
};

const DEFAULT_RIDERS = ['yowas', 'onesphore', 'paul', 'fred', 'uzziah', 'valens'];
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to sanitize order objects against corrupt/partial JSON
function sanitizeOrder(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const num = Number(raw.orderNumber) || 1;
  return {
    id: String(raw.id || 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
    orderNumber: num,
    orderLabel: String(raw.orderLabel || `Order ${num}`),
    driver: String(raw.driver || 'Unassigned'),
    status: String(raw.status || 'in_transit'),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    startedAt: String(raw.startedAt || raw.createdAt || new Date().toISOString()),
    timerDurationSeconds: Number(raw.timerDurationSeconds) || 1800,
    deliveredAt: raw.deliveredAt ? String(raw.deliveredAt) : null,
    totalTimeTakenSeconds: raw.totalTimeTakenSeconds !== undefined && raw.totalTimeTakenSeconds !== null ? Number(raw.totalTimeTakenSeconds) : null,
    overdueBySeconds: raw.overdueBySeconds !== undefined && raw.overdueBySeconds !== null ? Number(raw.overdueBySeconds) : null,
    isRemovedFromActive: Boolean(raw.isRemovedFromActive),
  };
}

export function DeliveryProvider({ children }) {
  // --- Auth State ---
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.loginTime && Date.now() - parsed.loginTime < SESSION_DURATION_MS) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading auth from localStorage', e);
    }
    return { user: null, role: null, loginTime: null };
  });

  // --- Date Range Filter State ---
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // --- Live Toast Notifications State ---
  const [toastList, setToastList] = useState([]);

  const removeToast = useCallback((id) => {
    setToastList((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info' }) => {
    const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newToast = { id: toastId, title: String(title || 'Notice'), message: String(message || ''), type, timestamp: Date.now() };
    setToastList((prev) => [newToast, ...prev].slice(0, 4));

    setTimeout(() => {
      removeToast(toastId);
    }, 6000);
  }, [removeToast]);

  // --- Riders State ---
  const [riders, setRiders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RIDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(String);
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
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeOrder).filter(Boolean);
        }
      }
    } catch (e) {
      console.error('Error loading orders', e);
    }
    return [];
  });

  // --- Broadcast Channel Setup for local tabs ---
  useEffect(() => {
    let channel;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('delivery_tracker_sync');
        channel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'SYNC_ORDERS' && Array.isArray(payload)) {
            setOrders(payload.map(sanitizeOrder).filter(Boolean));
          } else if (type === 'SYNC_RIDERS' && Array.isArray(payload)) {
            setRiders(payload.map(String));
          }
        };
      } catch (e) {}
    }

    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setOrders(parsed.map(sanitizeOrder).filter(Boolean));
          }
        } catch (err) {}
      }
      if (e.key === STORAGE_KEYS.RIDERS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setRiders(parsed.map(String));
          }
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
      if (channel) {
        try {
          channel.close();
        } catch (e) {}
      }
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const broadcastSync = useCallback((type, payload) => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('delivery_tracker_sync');
        channel.postMessage({ type, payload });
        channel.close();
      } catch (e) {}
    }
  }, []);

  // --- Update Local Orders & Broadcast ---
  const updateOrders = useCallback((newOrders) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(newOrders));
    } catch (e) {}
    broadcastSync('SYNC_ORDERS', newOrders);
  }, [broadcastSync]);

  // --- Update Local Riders & Broadcast ---
  const updateRiders = useCallback((newRiders) => {
    setRiders(newRiders);
    try {
      localStorage.setItem(STORAGE_KEYS.RIDERS, JSON.stringify(newRiders));
    } catch (e) {}
    broadcastSync('SYNC_RIDERS', newRiders);
  }, [broadcastSync]);

  // --- Login / Logout ---
  const login = useCallback((username, password) => {
    if (username === 'admin' && password === 'nihemart@2026') {
      const newAuth = { user: 'admin', role: 'admin', loginTime: Date.now() };
      setAuth(newAuth);
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuth));
      } catch (e) {}
      return { success: true, role: 'admin' };
    }
    if (username === 'user' && password === 'nihemart@20266') {
      const newAuth = { user: 'user', role: 'viewer', loginTime: Date.now() };
      setAuth(newAuth);
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuth));
      } catch (e) {}
      return { success: true, role: 'viewer' };
    }
    return { success: false, error: 'Invalid username or password' };
  }, []);

  const logout = useCallback(() => {
    const newAuth = { user: null, role: null, loginTime: null };
    setAuth(newAuth);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {}
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
    const updated = (orders || []).map((order) => {
      if (!order) return order;
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
    }).filter(Boolean);

    if (hasChanges) {
      updateOrders(updated);
    }
  }, [now, orders, updateOrders]);

  // --- Add Rider ---
  const addRider = useCallback((name) => {
    const trimmed = String(name || '').trim();
    if (!trimmed) return false;
    if (riders.some((r) => String(r).toLowerCase() === trimmed.toLowerCase())) {
      return true; // Already exists
    }
    const updated = [...riders, trimmed];
    updateRiders(updated);
    addToast({ title: 'New Rider Added', message: `Driver "${trimmed}" added to roster`, type: 'info' });
    return true;
  }, [riders, updateRiders, addToast]);

  // --- Create Order ---
  const createOrder = useCallback(({ orderNumber, driver, timerDurationSeconds }) => {
    const nowIso = new Date().toISOString();
    const newOrder = sanitizeOrder({
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
    });

    const updated = [newOrder, ...orders];
    updateOrders(updated);
    addToast({
      title: 'Order Started',
      message: `Started Order ${orderNumber} (Driver: ${driver || 'Unassigned'})`,
      type: 'new_order',
    });
    return newOrder;
  }, [orders, updateOrders, addToast]);

  // --- Change Order Status ---
  const setOrderStatus = useCallback((orderId, newStatus) => {
    const nowIso = new Date().toISOString();
    const nowTime = new Date(nowIso).getTime();

    let targetOrder = null;
    const updated = (orders || []).map((order) => {
      if (!order || order.id !== orderId) return order;

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

      targetOrder = {
        ...order,
        status: String(newStatus),
        deliveredAt,
        totalTimeTakenSeconds,
        overdueBySeconds,
      };
      return targetOrder;
    }).filter(Boolean);

    updateOrders(updated);
    if (targetOrder) {
      const statusFormatted = (newStatus || '').replace('_', ' ').toUpperCase();
      addToast({
        title: 'Status Updated',
        message: `${targetOrder.orderLabel} marked as ${statusFormatted}`,
        type: newStatus === 'delivered' ? 'success' : newStatus === 'overdue' ? 'warning' : 'info',
      });
    }
  }, [orders, updateOrders, addToast]);

  // --- Mark Delivered ---
  const markDelivered = useCallback((orderId) => {
    setOrderStatus(orderId, 'delivered');
  }, [setOrderStatus]);

  // --- Soft Remove Order from Active List ---
  const removeOrder = useCallback((orderId) => {
    let targetOrder = null;
    const updated = (orders || []).map((ord) => {
      if (ord && ord.id === orderId) {
        targetOrder = { ...ord, isRemovedFromActive: true };
        return targetOrder;
      }
      return ord;
    }).filter(Boolean);
    updateOrders(updated);
    if (targetOrder) {
      addToast({
        title: 'Order Removed',
        message: `${targetOrder.orderLabel} removed from active view`,
        type: 'danger',
      });
    }
  }, [orders, updateOrders, addToast]);

  // --- Active Order Numbers locked/disabled ---
  const lockedOrderNumbers = useMemo(() => {
    const set = new Set();
    (orders || []).forEach((order) => {
      if (order && !order.isRemovedFromActive && (order.status === 'in_transit' || order.status === 'overdue')) {
        set.add(Number(order.orderNumber));
      }
    });
    return set;
  }, [orders]);

  // --- Filtered Orders by Calendar Date / Date Range ---
  const filteredOrders = useMemo(() => {
    if (!dateRange.startDate && !dateRange.endDate) return orders;
    return (orders || []).filter((order) =>
      order && isTimestampInDateRange(order.createdAt, dateRange.startDate, dateRange.endDate)
    );
  }, [orders, dateRange]);

  // --- Stat Cards Calculations (Card 0) ---
  const stats = useMemo(() => {
    let totalOrders = 0;
    let inTransit = 0;
    let totalDelivered = 0;
    let totalOverdue = 0;
    let totalFailed = 0;

    (filteredOrders || []).forEach((order) => {
      if (!order) return;
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
    toastList,
    addToast,
    removeToast,
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
