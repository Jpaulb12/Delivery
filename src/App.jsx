import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import Login from './pages/Login';
import OperatorView from './pages/OperatorView';
import ViewerView from './pages/ViewerView';

function ProtectedRoute({ children, requiredRole }) {
  const { auth } = useDelivery();

  if (!auth.user || !auth.role) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && auth.role !== requiredRole) {
    if (auth.role === 'admin') return <Navigate to="/operator" replace />;
    return <Navigate to="/viewer" replace />;
  }

  return children;
}

function HomeRedirect() {
  const { auth } = useDelivery();
  if (!auth.user || !auth.role) {
    return <Navigate to="/login" replace />;
  }
  if (auth.role === 'admin') {
    return <Navigate to="/operator" replace />;
  }
  return <Navigate to="/viewer" replace />;
}

export default function App() {
  return (
    <DeliveryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/operator"
            element={
              <ProtectedRoute requiredRole="admin">
                <OperatorView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/viewer"
            element={
              <ProtectedRoute>
                <ViewerView />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </DeliveryProvider>
  );
}
